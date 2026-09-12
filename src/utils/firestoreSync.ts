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

  // 1. School Config
  try {
    const unsub = onSnapshot(
      doc(db, 'school_config', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const cfg = docSnap.data() as SchoolConfig;
          callbacks.onSchoolConfigLoaded?.(cfg);
          saveSchoolConfig(cfg);
        } else {
          // Seed if missing
          setDoc(doc(db, 'school_config', 'main'), initialFallbacks.schoolConfig, { merge: true }).catch(
            (e) => handleFirestoreError(e, OperationType.WRITE, 'school_config/main')
          );
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'school_config/main')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'school_config/main');
  }

  // 2. Rombels
  try {
    const unsub = onSnapshot(
      collection(db, 'rombels'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Rombel);
          callbacks.onRombelsLoaded?.(items);
          saveRombelList(items);
        } else if (initialFallbacks.rombels.length > 0) {
          // Seed initial rombels
          initialFallbacks.rombels.forEach((r) => {
            setDoc(doc(db, 'rombels', sanitizeDocId(r.id)), r, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `rombels/${r.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'rombels')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'rombels');
  }

  // 3. Students
  try {
    const unsub = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Student);
          callbacks.onStudentsLoaded?.(items);
          saveStudentList(items);
        } else if (initialFallbacks.students.length > 0) {
          initialFallbacks.students.forEach((s) => {
            setDoc(doc(db, 'students', sanitizeDocId(s.nipd)), s, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `students/${s.nipd}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'students')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'students');
  }

  // 4. Users
  try {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as UserAccount);
          callbacks.onUsersLoaded?.(items);
          saveUserList(items);
        } else if (initialFallbacks.users.length > 0) {
          initialFallbacks.users.forEach((u) => {
            setDoc(doc(db, 'users', sanitizeDocId(u.id)), u, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `users/${u.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'users')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'users');
  }

  // 5. Teachers
  try {
    const unsub = onSnapshot(
      collection(db, 'teachers'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Teacher);
          callbacks.onTeachersLoaded?.(items);
          saveTeacherList(items);
        } else if (initialFallbacks.teachers.length > 0) {
          initialFallbacks.teachers.forEach((t) => {
            setDoc(doc(db, 'teachers', sanitizeDocId(t.id)), t, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `teachers/${t.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'teachers')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'teachers');
  }

  // 6. Subjects
  try {
    const unsub = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as Subject);
          callbacks.onSubjectsLoaded?.(items);
          saveSubjectList(items);
        } else if (initialFallbacks.subjects.length > 0) {
          initialFallbacks.subjects.forEach((s) => {
            setDoc(doc(db, 'subjects', sanitizeDocId(s.id)), s, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `subjects/${s.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'subjects')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'subjects');
  }

  // 7. Schedules
  try {
    const unsub = onSnapshot(
      collection(db, 'schedules'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as ScheduleItem);
          callbacks.onSchedulesLoaded?.(items);
          saveScheduleList(items);
        } else if (initialFallbacks.schedules.length > 0) {
          initialFallbacks.schedules.forEach((sc) => {
            setDoc(doc(db, 'schedules', sanitizeDocId(sc.id)), sc, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `schedules/${sc.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'schedules')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'schedules');
  }

  // 8. Attendance Records
  try {
    const unsub = onSnapshot(
      collection(db, 'attendance_records'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as AttendanceRecord);
          callbacks.onAttendanceLoaded?.(items);
          saveAttendanceRecords(items);
        } else if (initialFallbacks.attendance.length > 0) {
          initialFallbacks.attendance.forEach((ar) => {
            setDoc(doc(db, 'attendance_records', sanitizeDocId(ar.id)), ar, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `attendance_records/${ar.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'attendance_records')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'attendance_records');
  }

  // 9. Tokens
  try {
    const unsub = onSnapshot(
      collection(db, 'tokens'),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => d.data() as AttendanceToken);
          callbacks.onTokensLoaded?.(items);
          saveTokens(items);
        } else if (initialFallbacks.tokens.length > 0) {
          initialFallbacks.tokens.forEach((tk) => {
            setDoc(doc(db, 'tokens', sanitizeDocId(tk.id)), tk, { merge: true }).catch((e) =>
              handleFirestoreError(e, OperationType.WRITE, `tokens/${tk.id}`)
            );
          });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'tokens')
    );
    unsubscribers.push(unsub);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'tokens');
  }

  return () => {
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
