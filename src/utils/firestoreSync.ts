import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Student,
  Rombel,
  UserAccount,
  Teacher,
  Subject,
  ScheduleItem,
  AttendanceRecord,
  AttendanceToken,
  SchoolConfig,
} from '../types';
import {
  saveStudentList,
  saveRombelList,
  saveUserList,
  saveTeacherList,
  saveSubjectList,
  saveScheduleList,
  saveAttendanceRecords,
  saveTokens,
  saveSchoolConfig,
  FullBackupPayload,
} from './storage';

// Safe doc id helper (escapes slashes and special characters if any)
export function sanitizeDocId(id: string): string {
  return encodeURIComponent(id).replace(/%/g, '_');
}

export interface FirestoreDataCallbacks {
  onStudentsLoaded?: (data: Student[]) => void;
  onRombelsLoaded?: (data: Rombel[]) => void;
  onUsersLoaded?: (data: UserAccount[]) => void;
  onTeachersLoaded?: (data: Teacher[]) => void;
  onSubjectsLoaded?: (data: Subject[]) => void;
  onSchedulesLoaded?: (data: ScheduleItem[]) => void;
  onAttendanceLoaded?: (data: AttendanceRecord[]) => void;
  onTokensLoaded?: (data: AttendanceToken[]) => void;
  onSchoolConfigLoaded?: (data: SchoolConfig) => void;
  onInitialSyncComplete?: () => void;
}

// Reusable batch chunking helper to write up to 400 docs per transaction safely
export async function firestoreSaveBatchChunked<T>(
  collectionName: string,
  items: T[],
  getId: (item: T) => string
): Promise<void> {
  if (!items || items.length === 0) return;
  const CHUNK_SIZE = 400;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((item) => {
      const docId = sanitizeDocId(getId(item));
      batch.set(doc(db, collectionName, docId), item, { merge: true });
    });
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    }
  }
}


// Subscribe to all collections for real-time multi-device synchronization
export function subscribeToFirestore(
  callbacks: FirestoreDataCallbacks,
  initialFallbacks: {
    students: Student[];
    rombels: Rombel[];
    users: UserAccount[];
    teachers: Teacher[];
    subjects: Subject[];
    schedules: ScheduleItem[];
    attendance: AttendanceRecord[];
    tokens: AttendanceToken[];
    schoolConfig: SchoolConfig;
  }
) {
  const unsubscribers: (() => void)[] = [];
  let pendingInitialListeners = 9;

  const notifyInitialLoaded = () => {
    pendingInitialListeners--;
    if (pendingInitialListeners <= 0) {
      callbacks.onInitialSyncComplete?.();
    }
  };

  // 1. School Config
  try {
    const unsub = onSnapshot(
      doc(db, 'school_config', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const cfg = docSnap.data() as SchoolConfig;
          if (
            cfg.namaSekolah === 'SMK KESEHATAN BHAKTI HUSADA' ||
            cfg.namaSekolah?.toLowerCase().includes('bhakti husada')
          ) {
            cfg.namaSekolah = 'SMK Bakti Putra Mandiri';
            if (cfg.email && cfg.email.includes('husada')) {
              cfg.email = 'info@smkbaktiputramandiri.sch.id';
            }
            if (cfg.website && cfg.website.includes('husada')) {
              cfg.website = 'www.smkbaktiputramandiri.sch.id';
            }
            setDoc(doc(db, 'school_config', 'main'), cfg, { merge: true }).catch(() => {});
          }
          callbacks.onSchoolConfigLoaded?.(cfg);
          saveSchoolConfig(cfg);
        } else {
          // Only seed if missing completely in Firestore
          setDoc(doc(db, 'school_config', 'main'), initialFallbacks.schoolConfig, { merge: true }).catch(
            (e) => handleFirestoreError(e, OperationType.WRITE, 'school_config/main')
          );
        }
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'school_config/main');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'school_config/main');
    notifyInitialLoaded();
  }

  // 2. Rombels
  try {
    const unsub = onSnapshot(
      collection(db, 'rombels'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Rombel);
        callbacks.onRombelsLoaded?.(items);
        saveRombelList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'rombels');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'rombels');
    notifyInitialLoaded();
  }

  // 3. Students
  try {
    const unsub = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Student);
        callbacks.onStudentsLoaded?.(items);
        saveStudentList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'students');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'students');
    notifyInitialLoaded();
  }

  // 4. Users
  try {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as UserAccount);
        callbacks.onUsersLoaded?.(items);
        saveUserList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'users');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'users');
    notifyInitialLoaded();
  }

  // 5. Teachers (Preserves deletions across all devices)
  try {
    const unsub = onSnapshot(
      collection(db, 'teachers'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Teacher);
        callbacks.onTeachersLoaded?.(items);
        saveTeacherList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'teachers');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'teachers');
    notifyInitialLoaded();
  }

  // 6. Subjects
  try {
    const unsub = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as Subject);
        callbacks.onSubjectsLoaded?.(items);
        saveSubjectList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'subjects');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'subjects');
    notifyInitialLoaded();
  }

  // 7. Schedules
  try {
    const unsub = onSnapshot(
      collection(db, 'schedules'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as ScheduleItem);
        callbacks.onSchedulesLoaded?.(items);
        saveScheduleList(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'schedules');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'schedules');
    notifyInitialLoaded();
  }

  // 8. Attendance Records
  try {
    const unsub = onSnapshot(
      collection(db, 'attendance_records'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AttendanceRecord);
        callbacks.onAttendanceLoaded?.(items);
        saveAttendanceRecords(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'attendance_records');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'attendance_records');
    notifyInitialLoaded();
  }

  // 9. Tokens
  try {
    const unsub = onSnapshot(
      collection(db, 'tokens'),
      (snap) => {
        const items = snap.docs.map((d) => d.data() as AttendanceToken);
        callbacks.onTokensLoaded?.(items);
        saveTokens(items);
        notifyInitialLoaded();
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, 'tokens');
        notifyInitialLoaded();
      }
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'tokens');
    notifyInitialLoaded();
  }

  // Safety fallback: unblock UI within 1.5 seconds if network latency occurs
  const fallbackTimer = setTimeout(() => {
    callbacks.onInitialSyncComplete?.();
  }, 1500);

  return () => {
    clearTimeout(fallbackTimer);
    unsubscribers.forEach((fn) => fn());
  };
}

// =========================================================================
// MUTATION HELPERS: Directly save/delete in Firestore (persists across devices)
// =========================================================================

export async function firestoreSaveStudent(student: Student) {
  try {
    await setDoc(doc(db, 'students', sanitizeDocId(student.nipd)), student, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.nipd}`);
  }
}

export async function firestoreDeleteStudent(nipd: string) {
  try {
    await deleteDoc(doc(db, 'students', sanitizeDocId(nipd)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${nipd}`);
  }
}

export async function firestoreSaveRombel(rombel: Rombel) {
  try {
    await setDoc(doc(db, 'rombels', sanitizeDocId(rombel.id)), rombel, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `rombels/${rombel.id}`);
  }
}

export async function firestoreDeleteRombel(rombelId: string) {
  try {
    await deleteDoc(doc(db, 'rombels', sanitizeDocId(rombelId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `rombels/${rombelId}`);
  }
}

export async function firestoreSaveUser(user: UserAccount) {
  try {
    await setDoc(doc(db, 'users', sanitizeDocId(user.id)), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

export async function firestoreDeleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, 'users', sanitizeDocId(userId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
  }
}

export async function firestoreSaveTeacher(teacher: Teacher) {
  try {
    await setDoc(doc(db, 'teachers', sanitizeDocId(teacher.id)), teacher, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `teachers/${teacher.id}`);
  }
}

export async function firestoreDeleteTeacher(teacherId: string) {
  try {
    await deleteDoc(doc(db, 'teachers', sanitizeDocId(teacherId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `teachers/${teacherId}`);
  }
}

export async function firestoreSaveSubject(subject: Subject) {
  try {
    await setDoc(doc(db, 'subjects', sanitizeDocId(subject.id)), subject, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `subjects/${subject.id}`);
  }
}

export async function firestoreDeleteSubject(subjectId: string) {
  try {
    await deleteDoc(doc(db, 'subjects', sanitizeDocId(subjectId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `subjects/${subjectId}`);
  }
}

export async function firestoreSaveSchedule(schedule: ScheduleItem) {
  try {
    await setDoc(doc(db, 'schedules', sanitizeDocId(schedule.id)), schedule, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `schedules/${schedule.id}`);
  }
}

export async function firestoreDeleteSchedule(scheduleId: string) {
  try {
    await deleteDoc(doc(db, 'schedules', sanitizeDocId(scheduleId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `schedules/${scheduleId}`);
  }
}

export async function firestoreSaveAttendanceRecord(record: AttendanceRecord) {
  try {
    await setDoc(doc(db, 'attendance_records', sanitizeDocId(record.id)), record, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance_records/${record.id}`);
  }
}

export async function firestoreSaveAttendanceRecordsBatch(records: AttendanceRecord[]) {
  try {
    const batch = writeBatch(db);
    records.forEach((r) => {
      batch.set(doc(db, 'attendance_records', sanitizeDocId(r.id)), r, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'attendance_records');
  }
}

export async function firestoreDeleteAttendanceRecord(recordId: string) {
  try {
    await deleteDoc(doc(db, 'attendance_records', sanitizeDocId(recordId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `attendance_records/${recordId}`);
  }
}

export async function firestoreDeleteAttendanceRecordsBatch(recordIds: string[]) {
  try {
    const batch = writeBatch(db);
    recordIds.forEach((id) => {
      batch.delete(doc(db, 'attendance_records', sanitizeDocId(id)));
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'attendance_records_batch');
  }
}

export async function firestoreSaveToken(token: AttendanceToken) {
  try {
    await setDoc(doc(db, 'tokens', sanitizeDocId(token.id)), token, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tokens/${token.id}`);
  }
}

export async function firestoreDeleteToken(tokenId: string) {
  try {
    await deleteDoc(doc(db, 'tokens', sanitizeDocId(tokenId)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tokens/${tokenId}`);
  }
}

export async function firestoreSaveSchoolConfig(config: SchoolConfig) {
  try {
    await setDoc(doc(db, 'school_config', 'main'), config, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'school_config/main');
  }
}

export async function firestoreSaveUsersBatch(users: UserAccount[]): Promise<void> {
  return firestoreSaveBatchChunked('users', users, (u) => u.id);
}

export async function firestoreSaveStudentsBatch(students: Student[]): Promise<void> {
  return firestoreSaveBatchChunked('students', students, (s) => s.nipd);
}

export async function firestoreSaveTeachersBatch(teachers: Teacher[]): Promise<void> {
  return firestoreSaveBatchChunked('teachers', teachers, (t) => t.id);
}

export async function firestoreSaveSubjectsBatch(subjects: Subject[]): Promise<void> {
  return firestoreSaveBatchChunked('subjects', subjects, (s) => s.id);
}

export async function firestoreSaveSchedulesBatch(schedules: ScheduleItem[]): Promise<void> {
  return firestoreSaveBatchChunked('schedules', schedules, (sc) => sc.id);
}

// Reconciles Firestore collection with new list: removes obsolete docs and writes updated items
async function reconcileCollection<T>(
  collectionName: string,
  newItems: T[],
  getId: (item: T) => string
): Promise<void> {
  try {
    const newIds = new Set(newItems.map((item) => sanitizeDocId(getId(item))));
    const snap = await getDocs(collection(db, collectionName));
    const toDelete: string[] = [];
    snap.docs.forEach((d) => {
      if (!newIds.has(d.id)) {
        toDelete.push(d.id);
      }
    });
    for (const docId of toDelete) {
      await deleteDoc(doc(db, collectionName, docId)).catch(() => {});
    }
  } catch (err) {
    console.warn(`[Reconcile ${collectionName}] Warning:`, err);
  }
  await firestoreSaveBatchChunked(collectionName, newItems, getId);
}

// Restore entire system backup data directly to Firebase Firestore
export async function firestoreRestoreFullBackup(payload: FullBackupPayload): Promise<boolean> {
  try {
    // 1. School config
    if (payload.schoolConfig) {
      await firestoreSaveSchoolConfig(payload.schoolConfig);
    }
    // 2. Rombels
    if (payload.rombels && payload.rombels.length > 0) {
      await reconcileCollection('rombels', payload.rombels, (r) => r.id);
    }
    // 3. Students
    if (payload.students && payload.students.length > 0) {
      await reconcileCollection('students', payload.students, (s) => s.nipd);
    }
    // 4. Users
    if (payload.users && payload.users.length > 0) {
      await reconcileCollection('users', payload.users, (u) => u.id);
    }
    // 5. Teachers
    if (payload.teachers && payload.teachers.length > 0) {
      await reconcileCollection('teachers', payload.teachers, (t) => t.id);
    }
    // 6. Subjects
    if (payload.subjects && payload.subjects.length > 0) {
      await reconcileCollection('subjects', payload.subjects, (s) => s.id);
    }
    // 7. Schedules
    if (payload.schedules && payload.schedules.length > 0) {
      await reconcileCollection('schedules', payload.schedules, (sc) => sc.id);
    }
    // 8. Attendance Records
    if (payload.attendanceRecords && payload.attendanceRecords.length > 0) {
      await reconcileCollection('attendance_records', payload.attendanceRecords, (ar) => ar.id);
    }
    // 9. Tokens
    if (payload.tokens && payload.tokens.length > 0) {
      await reconcileCollection('tokens', payload.tokens, (tk) => tk.id);
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'restore_full_backup');
    return false;
  }
}

