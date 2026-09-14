import React, { useState, useEffect } from 'react';
import {
  Student,
  Rombel,
  UserAccount,
  AttendanceRecord,
  AttendanceToken,
  SchoolConfig,
  UserRole,
  Teacher,
  Subject,
  ScheduleItem,
} from './types';
import {
  loadStudentList,
  saveStudentList,
  loadRombelList,
  saveRombelList,
  loadUserList,
  saveUserList,
  loadAttendanceRecords,
  saveAttendanceRecords,
  loadTokens,
  saveTokens,
  loadSchoolConfig,
  saveSchoolConfig,
  loadCurrentUser,
  saveCurrentUser,
  ensureStudentUserAccount,
  removeStudentUserAccount,
  recordAttendance,
  saveAttendanceRecordDirect,
  deleteAttendanceRecord,
  deleteAttendanceByStudentAndDate,
  deleteAttendanceRecordsBatch,
  validateTokenAndCheckIn,
  getTodayDateStr,
  getCurrentTimeStr,
  loadTeacherList,
  saveTeacherList,
  loadSubjectList,
  saveSubjectList,
  loadScheduleList,
  saveScheduleList,
  ensureTeacherUserAccount,
  removeTeacherUserAccount,
} from './utils/storage';
import { syncRombelOfficersWithUserAccounts } from './utils/officerSync';
import { getHolidayInfo, formatIndonesianDateWithDay } from './utils/holidays';
import {
  subscribeToFirestore,
  firestoreSaveStudent,
  firestoreDeleteStudent,
  firestoreSaveRombel,
  firestoreDeleteRombel,
  firestoreSaveUser,
  firestoreDeleteUser,
  firestoreSaveTeacher,
  firestoreDeleteTeacher,
  firestoreSaveSubject,
  firestoreDeleteSubject,
  firestoreSaveSchedule,
  firestoreDeleteSchedule,
  firestoreSaveAttendanceRecord,
  firestoreSaveAttendanceRecordsBatch,
  firestoreDeleteAttendanceRecord,
  firestoreDeleteAttendanceRecordsBatch,
  firestoreSaveToken,
  firestoreDeleteToken,
  firestoreSaveSchoolConfig,
  firestoreSaveUsersBatch,
  firestoreSaveStudentsBatch,
  firestoreRestoreFullBackup,
} from './utils/firestoreSync';

// Subcomponents
import { LoginPage } from './components/LoginPage';
import { ClassAttendanceTab } from './components/ClassAttendanceTab';
import { ManageAttendanceTab } from './components/ManageAttendanceTab';
import { ManageStudentsTab } from './components/ManageStudentsTab';
import { ManageRombelTab } from './components/ManageRombelTab';
import { ManageUsersTab } from './components/ManageUsersTab';
import { ManageStudentAccountsTab } from './components/ManageStudentAccountsTab';
import { ManageTeachersTab } from './components/ManageTeachersTab';
import { ManageSubjectsAndScheduleTab } from './components/ManageSubjectsAndScheduleTab';
import { ReportsPrintTab } from './components/ReportsPrintTab';
import { StudentPortalTab } from './components/StudentPortalTab';
import { QRScannerModal } from './components/QRScannerModal';
import { TokenManagerModal } from './components/TokenManagerModal';
import { StudentCardModal } from './components/StudentCardModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { ArchitectureDocsModal } from './components/ArchitectureDocsModal';
import { DataBackupModal } from './components/DataBackupModal';
import { BirthdayCelebrationModal } from './components/BirthdayCelebrationModal';
import { getUserGreetingDetails } from './utils/greetings';

// Icons
import {
  QrCode,
  Users,
  Building2,
  FileText,
  Key,
  Settings,
  Shield,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  UserCheck,
  User,
  Database,
  GraduationCap,
  BookOpen,
  CalendarDays,
  UserPlus,
  ClipboardEdit,
  Cake,
  PartyPopper,
} from 'lucide-react';

export default function App() {
  // Master State from Storage
  const [students, setStudents] = useState<Student[]>(() => loadStudentList());
  const [rombels, setRombels] = useState<Rombel[]>(() => loadRombelList());
  const [users, setUsers] = useState<UserAccount[]>(() => loadUserList());
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadTeacherList());
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjectList());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => loadScheduleList());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() =>
    loadAttendanceRecords()
  );
  const [tokens, setTokens] = useState<AttendanceToken[]>(() => loadTokens());
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => loadSchoolConfig());

  // Current Authenticated User (null means Login Page is displayed)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return loadCurrentUser();
  });

  // Greeting & Birthday Modal states
  const [showBirthdayModal, setShowBirthdayModal] = useState<boolean>(false);
  const [welcomeGreetingBanner, setWelcomeGreetingBanner] = useState<{
    show: boolean;
    icon: string;
    title: string;
    message: string;
  } | null>(null);

  // Matched student for the currently logged in user (if student / pengurus)
  const matchedStudentForUser = currentUser?.nipd
    ? students.find((s) => s.nipd === currentUser.nipd)
    : null;

  // Personalized Greeting & Birthday info for currentUser
  const userGreetingDetails = currentUser
    ? getUserGreetingDetails(currentUser, matchedStudentForUser)
    : null;

  // Auto-sync currentUser's foto with student's foto
  useEffect(() => {
    if (currentUser?.nipd) {
      const matched = students.find((s) => s.nipd === currentUser.nipd);
      if (matched && matched.foto && matched.foto !== currentUser.foto) {
        const updated = { ...currentUser, foto: matched.foto };
        setCurrentUser(updated);
        saveCurrentUser(updated);
      }
    }
  }, [students, currentUser?.nipd]);

  // Login & Logout Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    let finalUser = { ...user };
    const matchedStd = finalUser.nipd ? students.find((s) => s.nipd === finalUser.nipd) : null;
    if (matchedStd?.foto && !finalUser.foto) {
      finalUser.foto = matchedStd.foto;
    }

    saveCurrentUser(finalUser);
    setCurrentUser(finalUser);
    if (finalUser.role === 'siswa') {
      setActiveTab('student_portal');
    } else {
      setActiveTab('attendance');
    }

    // Greet user on login & check birthday
    const greeting = getUserGreetingDetails(finalUser, matchedStd);
    if (greeting.isBirthday) {
      setShowBirthdayModal(true);
      showToast(`🎂 Selamat Ulang Tahun, ${finalUser.nama}! 🎉`, 'success');
    } else {
      setWelcomeGreetingBanner({
        show: true,
        icon: greeting.icon,
        title: greeting.headlineGreeting,
        message: greeting.subtext,
      });
      showToast(`${greeting.timeGreeting}, ${finalUser.nama}!`, 'success');
    }
  };

  const handleLogout = () => {
    // Flush all current data to localStorage before ending session
    saveStudentList(students);
    saveRombelList(rombels);
    saveUserList(users);
    saveTeacherList(teachers);
    saveSubjectList(subjects);
    saveScheduleList(schedules);
    saveSchoolConfig(schoolConfig);
    saveAttendanceRecords(attendanceRecords);
    saveTokens(tokens);

    saveCurrentUser(null);
    setCurrentUser(null);
    showToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  // Navigation Tab
  // Options: 'attendance', 'students', 'rombel', 'users', 'reports', 'student_portal'
  const [activeTab, setActiveTab] = useState<string>('attendance');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTokenManagerOpen, setIsTokenManagerOpen] = useState(false);
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isArchDocsOpen, setIsArchDocsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Global scan / action notification banner
  const [toastNotice, setToastNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => setToastNotice(null), 4500);
  };

  // Sync to localStorage
  useEffect(() => {
    saveStudentList(students);
  }, [students]);

  useEffect(() => {
    saveRombelList(rombels);
  }, [rombels]);

  useEffect(() => {
    saveUserList(users);
  }, [users]);

  useEffect(() => {
    saveAttendanceRecords(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    saveTokens(tokens);
  }, [tokens]);

  useEffect(() => {
    saveSchoolConfig(schoolConfig);
  }, [schoolConfig]);

  useEffect(() => {
    saveTeacherList(teachers);
  }, [teachers]);

  useEffect(() => {
    saveSubjectList(subjects);
  }, [subjects]);

  useEffect(() => {
    saveScheduleList(schedules);
  }, [schedules]);

  // Real-time Cloud Sync with Firebase Firestore (Persists across devices)
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    try {
      const cfg = localStorage.getItem('absensi_school_config_v1');
      if (cfg) {
        const parsed = JSON.parse(cfg);
        if (parsed && parsed.namaSekolah) return false;
      }
    } catch {}
    return true;
  });

  useEffect(() => {
    const unsubscribe = subscribeToFirestore(
      {
        onStudentsLoaded: (data) => {
          setStudents(data);
          setIsCloudSynced(true);
        },
        onRombelsLoaded: (data) => {
          setRombels(data);
          setIsCloudSynced(true);
        },
        onUsersLoaded: (data) => {
          setUsers(data);
          setIsCloudSynced(true);
        },
        onTeachersLoaded: (data) => {
          setTeachers(data);
          setIsCloudSynced(true);
        },
        onSubjectsLoaded: (data) => {
          setSubjects(data);
          setIsCloudSynced(true);
        },
        onSchedulesLoaded: (data) => {
          setSchedules(data);
          setIsCloudSynced(true);
        },
        onAttendanceLoaded: (data) => {
          setAttendanceRecords(data);
          setIsCloudSynced(true);
        },
        onTokensLoaded: (data) => {
          setTokens(data);
          setIsCloudSynced(true);
        },
        onSchoolConfigLoaded: (data) => {
          setSchoolConfig(data);
          setIsCloudSynced(true);
        },
        onInitialSyncComplete: () => {
          setIsInitialLoading(false);
          setIsCloudSynced(true);
        },
      },
      {
        students,
        rombels,
        users,
        teachers,
        subjects,
        schedules,
        attendance: attendanceRecords,
        tokens,
        schoolConfig,
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Adjust active tab if user role changes (e.g. Siswa goes to student portal, ketua kelas cannot open reports)
  useEffect(() => {
    if (currentUser?.role === 'siswa') {
      if (activeTab !== 'student_portal' && activeTab !== 'schedules') {
        setActiveTab('student_portal');
      }
    } else if ((currentUser?.role === 'ketua_kelas' || currentUser?.role === 'sekretaris') && activeTab === 'reports') {
      setActiveTab('attendance');
    } else if (
      activeTab === 'student_portal' &&
      currentUser &&
      currentUser.role !== 'siswa' &&
      currentUser.role !== 'admin' &&
      currentUser.role !== 'guru' &&
      currentUser.role !== 'ketua_kelas' &&
      currentUser.role !== 'sekretaris'
    ) {
      setActiveTab('attendance');
    }
  }, [currentUser?.role, activeTab]);

  // Attendance Actions
  const handleUpdateSingleAttendance = (
    nipd: string,
    status: 'hadir' | 'sakit' | 'izin' | 'alfa',
    keterangan?: string,
    targetDate?: string,
    targetTime?: string
  ) => {
    const student = students.find((s) => s.nipd === nipd);
    if (!student) return;

    const dateToUse = targetDate || getTodayDateStr();

    const updated = recordAttendance(
      nipd,
      student.rombelId,
      status,
      currentUser.role === 'admin'
        ? 'manual_admin'
        : currentUser.role === 'guru'
        ? 'manual_guru'
        : 'manual_pengurus',
      currentUser.role,
      currentUser.nama,
      undefined,
      keterangan,
      dateToUse,
      targetTime
    );
    setAttendanceRecords(updated);
    const updatedRec = updated.find((r) => r.nipd === nipd && r.tanggal === dateToUse);
    if (updatedRec) {
      firestoreSaveAttendanceRecord(updatedRec);
    }
    showToast(
      `Status presensi ${student.nama} diperbarui menjadi: ${status.toUpperCase()} (${dateToUse} ${targetTime || ''})`,
      'info'
    );
  };

  const handleBulkUpdateAttendance = (
    nipds: string[],
    status: 'hadir' | 'sakit' | 'izin' | 'alfa',
    targetDate?: string
  ) => {
    let current = [...attendanceRecords];
    const isOfficer =
      currentUser.role === 'walas' ||
      currentUser.role === 'ketua_kelas' ||
      currentUser.role === 'sekretaris';

    const metode =
      currentUser.role === 'admin'
        ? 'manual_admin'
        : currentUser.role === 'guru'
        ? 'manual_guru'
        : 'manual_pengurus';

    const dateToUse = targetDate || getTodayDateStr();

    nipds.forEach((nipd) => {
      const student = students.find((s) => s.nipd === nipd);
      if (student) {
        // Enforce rombel restriction if leader
        if (isOfficer && currentUser.rombelId && student.rombelId !== currentUser.rombelId) {
          return;
        }
        current = recordAttendance(
          nipd,
          student.rombelId,
          status,
          metode,
          currentUser.role,
          currentUser.nama,
          undefined,
          undefined,
          dateToUse
        );
      }
    });
    setAttendanceRecords(current);
    const batchRecs = current.filter((r) => nipds.includes(r.nipd) && r.tanggal === dateToUse);
    if (batchRecs.length > 0) {
      firestoreSaveAttendanceRecordsBatch(batchRecs);
    }
    showToast(`${nipds.length} siswa ditandai ${status.toUpperCase()} (${dateToUse})`, 'success');
  };

  // Dedicated CRUD Handlers for Attendance (Pusat Koreksi & Kelola Kesalahan Absen)
  const handleSaveAttendanceRecord = (record: AttendanceRecord) => {
    const next = saveAttendanceRecordDirect(record);
    setAttendanceRecords(next);
    firestoreSaveAttendanceRecord(record);
    showToast(`Rekaman presensi siswa berhasil disimpan & disinkronkan.`, 'success');
  };

  const handleDeleteAttendanceRecord = (recordId: string) => {
    const next = deleteAttendanceRecord(recordId);
    setAttendanceRecords(next);
    firestoreDeleteAttendanceRecord(recordId);
    showToast('Rekaman presensi dihapus. Status siswa kembali menjadi "Belum Absen".', 'info');
  };

  const handleBatchDeleteAttendanceRecords = (recordIds: string[]) => {
    const next = deleteAttendanceRecordsBatch(recordIds);
    setAttendanceRecords(next);
    firestoreDeleteAttendanceRecordsBatch(recordIds);
    showToast(`${recordIds.length} rekaman presensi berhasil dihapus.`, 'info');
  };

  const handleResetStudentAttendance = (nipd: string, tanggal: string) => {
    const targetRec = attendanceRecords.find((r) => r.nipd === nipd && r.tanggal === tanggal);
    const next = deleteAttendanceByStudentAndDate(nipd, tanggal);
    setAttendanceRecords(next);
    if (targetRec) {
      firestoreDeleteAttendanceRecord(targetRec.id);
    }
    showToast(`Presensi tanggal ${tanggal} berhasil dikembalikan ke posisi "Belum Diabsen".`, 'info');
  };

  // Mass Reset to "Belum Diabsen" for multiple students
  const handleBulkResetAttendance = (nipds: string[], targetDate?: string) => {
    const dateToUse = targetDate || getTodayDateStr();
    let current = [...attendanceRecords];
    const targetRecs = current.filter((r) => nipds.includes(r.nipd) && r.tanggal === dateToUse);
    const targetIds = targetRecs.map((r) => r.id);
    const next = current.filter((r) => !(nipds.includes(r.nipd) && r.tanggal === dateToUse));
    setAttendanceRecords(next);
    saveAttendanceRecords(next);
    if (targetIds.length > 0) {
      firestoreDeleteAttendanceRecordsBatch(targetIds);
    }
    showToast(`${nipds.length} siswa berhasil dikembalikan ke status "Belum Diabsen" (${dateToUse}).`, 'info');
  };

  // QR Scan Callback (from camera or file upload)
  const handleQRScanned = (nipd: string) => {
    const cleanNipd = nipd.trim();
    const student = students.find((s) => s.nipd.trim() === cleanNipd);
    if (!student) {
      showToast(`NIPD "${cleanNipd}" tidak ditemukan dalam database siswa!`, 'error');
      return {
        success: false,
        message: `NIPD "${cleanNipd}" tidak ditemukan dalam database siswa!`,
      };
    }

    const updated = recordAttendance(
      student.nipd,
      student.rombelId,
      'hadir',
      'qr_scan',
      currentUser.role,
      currentUser.nama,
      undefined,
      'Presensi Scan QR Kamera'
    );
    setAttendanceRecords(updated);
    const today = getTodayDateStr();
    const todayRec = updated.find((r) => r.nipd === student.nipd && r.tanggal === today);
    if (todayRec) {
      firestoreSaveAttendanceRecord(todayRec);
    }
    showToast(`✓ Scan Berhasil! ${student.nama} (${student.nipd}) tercatat HADIR.`, 'success');
    return {
      success: true,
      message: `Presensi Berhasil: ${student.nama} (${student.nipd}) tercatat HADIR!`,
      student,
    };
  };

  // Token Creation & Deletion
  const handleCreateToken = (token: AttendanceToken) => {
    const nextTokens = [token, ...tokens];
    setTokens(nextTokens);
    saveTokens(nextTokens);
    firestoreSaveToken(token);
    showToast(`Token presensi "${token.token}" berhasil dibuat dan diaktifkan.`, 'success');
  };

  const handleDeleteToken = (id: string) => {
    const nextTokens = tokens.filter((t) => t.id !== id);
    setTokens(nextTokens);
    saveTokens(nextTokens);
    firestoreDeleteToken(id);
    showToast('Token presensi dihapus.', 'info');
  };

  // Student Self Token Check-in
  const handleStudentTokenCheckIn = (tokenStr: string) => {
    const studentNipd = currentUser.nipd;
    const student = students.find((s) => s.nipd === studentNipd);

    if (!student) {
      return { success: false, message: 'Data siswa untuk akun ini tidak ditemukan!' };
    }

    const result = validateTokenAndCheckIn(tokenStr, student, currentUser);
    if (result.success) {
      const allRecords = loadAttendanceRecords();
      setAttendanceRecords(allRecords);
      const today = getTodayDateStr();
      const updatedRec = allRecords.find((r) => r.nipd === student.nipd && r.tanggal === today);
      if (updatedRec) {
        firestoreSaveAttendanceRecord(updatedRec);
      }
      showToast(result.message, 'success');
    }
    return result;
  };

  // Master Data Mutators
  const handleAddStudent = (s: Student) => {
    const nextStudents = [s, ...students];
    setStudents(nextStudents);
    saveStudentList(nextStudents);
    firestoreSaveStudent(s);

    // Automatically create / link student UserAccount so student can log in right away!
    const { updatedUsers, createdUser } = ensureStudentUserAccount(s, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    if (createdUser) {
      firestoreSaveUser(createdUser);
    }

    showToast(`Siswa ${s.nama} (${s.nipd}) berhasil ditambahkan & akun login siap digunakan (PIN default: 123).`, 'success');
  };

  const handleUpdateStudent = (s: Student) => {
    const nextStudents = students.map((item) => (item.nipd === s.nipd ? s : item));
    setStudents(nextStudents);
    saveStudentList(nextStudents);
    firestoreSaveStudent(s);

    // Keep user account synchronized
    const { updatedUsers, createdUser } = ensureStudentUserAccount(s, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    if (createdUser) {
      firestoreSaveUser(createdUser);
    } else {
      const matchedUser = updatedUsers.find((u) => u.nipd === s.nipd);
      if (matchedUser) {
        firestoreSaveUser(matchedUser);
      }
    }

    if (currentUser?.nipd === s.nipd) {
      const updatedSelf = { ...currentUser, foto: s.foto, nama: s.nama };
      setCurrentUser(updatedSelf);
      saveCurrentUser(updatedSelf);
    }

    showToast(`Data siswa ${s.nama} berhasil diperbarui.`, 'success');
  };

  const handleDeleteStudent = (nipd: string) => {
    const nextStudents = students.filter((item) => item.nipd !== nipd);
    setStudents(nextStudents);
    saveStudentList(nextStudents);
    firestoreDeleteStudent(nipd);

    const cleanNipd = nipd.trim().replace(/[^a-zA-Z0-9]/g, '');
    const updatedUsers = removeStudentUserAccount(nipd, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    firestoreDeleteUser(`USR-STD-${cleanNipd}`);

    showToast(`Siswa dengan NIPD ${nipd} telah dihapus.`, 'info');
  };

  const handleAddRombel = (r: Rombel) => {
    const nextRombels = [...rombels, r];
    setRombels(nextRombels);
    saveRombelList(nextRombels);
    firestoreSaveRombel(r);

    // Sync officer accounts so appointed ketua/sekretaris have 1 single account with officer role
    const { updatedUsers } = syncRombelOfficersWithUserAccounts(nextRombels, students, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    showToast(`Rombel "${r.nama}" berhasil dibuat & akun pengurus disinkronkan.`, 'success');
  };

  const handleUpdateRombel = (r: Rombel) => {
    const nextRombels = rombels.map((item) => (item.id === r.id ? r : item));
    setRombels(nextRombels);
    saveRombelList(nextRombels);
    firestoreSaveRombel(r);

    // Sync officer accounts so appointed ketua/sekretaris have 1 single account with officer role
    const { updatedUsers } = syncRombelOfficersWithUserAccounts(nextRombels, students, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);

    // If current logged-in user is one of the affected students, update currentUser in session
    if (currentUser?.nipd) {
      const updatedSelf = updatedUsers.find((u) => u.nipd === currentUser.nipd);
      if (updatedSelf && (updatedSelf.role !== currentUser.role || updatedSelf.rombelId !== currentUser.rombelId)) {
        setCurrentUser(updatedSelf);
        saveCurrentUser(updatedSelf);
      }
    }

    showToast(`Rombel "${r.nama}" berhasil diperbarui & akun pengurus disinkronkan.`, 'success');
  };

  const handleDeleteRombel = (id: string) => {
    const nextRombels = rombels.filter((item) => item.id !== id);
    setRombels(nextRombels);
    saveRombelList(nextRombels);
    firestoreDeleteRombel(id);
    showToast('Rombel berhasil dihapus.', 'info');
  };

  const handleAddUser = (u: UserAccount) => {
    const nextUsers = [u, ...users];
    setUsers(nextUsers);
    saveUserList(nextUsers);
    firestoreSaveUser(u);
    showToast(`Akun "${u.nama}" berhasil dibuat dan disimpan.`, 'success');
  };

  const handleUpdateUser = (u: UserAccount) => {
    const nextUsers = users.map((item) => (item.id === u.id ? u : item));
    setUsers(nextUsers);
    saveUserList(nextUsers);
    firestoreSaveUser(u);

    // If this user is tied to a student, also update the student's foto
    if (u.nipd) {
      const stdIdx = students.findIndex((s) => s.nipd === u.nipd);
      if (stdIdx >= 0 && students[stdIdx].foto !== u.foto) {
        const nextStudents = [...students];
        nextStudents[stdIdx] = {
          ...nextStudents[stdIdx],
          foto: u.foto,
        };
        setStudents(nextStudents);
        saveStudentList(nextStudents);
        firestoreSaveStudent(nextStudents[stdIdx]);
      }
    }

    if (currentUser?.id === u.id) {
      setCurrentUser(u);
      saveCurrentUser(u);
    }
    showToast(`Akun "${u.nama}" berhasil diperbarui.`, 'success');
  };

  const handleDeleteUser = (id: string) => {
    const nextUsers = users.filter((item) => item.id !== id);
    setUsers(nextUsers);
    saveUserList(nextUsers);
    firestoreDeleteUser(id);
    showToast('Akun pengguna dihapus.', 'info');
  };

  // Teacher Handlers (CRUD Master Data Guru)
  const handleAddTeacher = (t: Teacher) => {
    const next = [t, ...teachers];
    setTeachers(next);
    saveTeacherList(next);
    firestoreSaveTeacher(t);

    // Auto-create/sync teacher user account for login
    const { updatedUsers, createdUser } = ensureTeacherUserAccount(t, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    if (createdUser) {
      firestoreSaveUser(createdUser);
    }

    showToast(`Data guru ${t.nama} (${t.nip || 'Non-NIP'}) berhasil ditambahkan & akun login siap digunakan (PIN default: 123).`, 'success');
  };

  const handleUpdateTeacher = (t: Teacher) => {
    const next = teachers.map((item) => (item.id === t.id ? t : item));
    setTeachers(next);
    saveTeacherList(next);
    firestoreSaveTeacher(t);

    const { updatedUsers, createdUser } = ensureTeacherUserAccount(t, users);
    setUsers(updatedUsers);
    saveUserList(updatedUsers);
    if (createdUser) {
      firestoreSaveUser(createdUser);
    }

    showToast(`Data guru ${t.nama} berhasil diperbarui.`, 'success');
  };

  const handleDeleteTeacher = (id: string) => {
    const teacherToDelete = teachers.find((t) => t.id === id);
    const next = teachers.filter((t) => t.id !== id);
    setTeachers(next);
    saveTeacherList(next);
    firestoreDeleteTeacher(id);

    if (teacherToDelete) {
      // Find matching user account to remove from Firestore
      const userToDelete = users.find(
        (u) =>
          u.id === `USR-GUR-${teacherToDelete.id}` ||
          (teacherToDelete.email && u.email?.toLowerCase().trim() === teacherToDelete.email.toLowerCase().trim()) ||
          (teacherToDelete.nip && u.username === teacherToDelete.nip.replace(/\s+/g, ''))
      );
      if (userToDelete && userToDelete.role !== 'admin') {
        firestoreDeleteUser(userToDelete.id);
      }
      const updatedUsers = removeTeacherUserAccount(teacherToDelete.email, teacherToDelete.nip, users);
      setUsers(updatedUsers);
      saveUserList(updatedUsers);
    }

    showToast('Data guru berhasil dihapus.', 'info');
  };

  // Subject Handlers (CRUD Mapel)
  const handleAddSubject = (s: Subject) => {
    const next = [...subjects, s];
    setSubjects(next);
    saveSubjectList(next);
    firestoreSaveSubject(s);
    showToast(`Mata pelajaran "${s.nama}" (${s.kode}) berhasil ditambahkan.`, 'success');
  };

  const handleUpdateSubject = (s: Subject) => {
    const next = subjects.map((item) => (item.id === s.id ? s : item));
    setSubjects(next);
    saveSubjectList(next);
    firestoreSaveSubject(s);
    showToast(`Mata pelajaran "${s.nama}" berhasil diperbarui.`, 'success');
  };

  const handleDeleteSubject = (id: string) => {
    const next = subjects.filter((item) => item.id !== id);
    setSubjects(next);
    saveSubjectList(next);
    firestoreDeleteSubject(id);
    showToast('Mata pelajaran berhasil dihapus.', 'info');
  };

  // Schedule Handlers (CRUD Jadwal)
  const handleAddSchedule = (sc: ScheduleItem) => {
    const next = [...schedules, sc];
    setSchedules(next);
    saveScheduleList(next);
    firestoreSaveSchedule(sc);
    showToast('Jadwal pelajaran berhasil ditambahkan.', 'success');
  };

  const handleUpdateSchedule = (sc: ScheduleItem) => {
    const next = schedules.map((item) => (item.id === sc.id ? sc : item));
    setSchedules(next);
    saveScheduleList(next);
    firestoreSaveSchedule(sc);
    showToast('Jadwal pelajaran berhasil diperbarui.', 'success');
  };

  const handleDeleteSchedule = (id: string) => {
    const next = schedules.filter((item) => item.id !== id);
    setSchedules(next);
    saveScheduleList(next);
    firestoreDeleteSchedule(id);
    showToast('Jadwal pelajaran berhasil dihapus.', 'info');
  };

  const handleSaveSchoolConfig = (newConf: SchoolConfig) => {
    setSchoolConfig(newConf);
    saveSchoolConfig(newConf);
    firestoreSaveSchoolConfig(newConf);
    showToast('Pengaturan profil sekolah & logo berhasil disimpan secara permanen.', 'success');
  };

  const handleDataRestored = async (restored: any) => {
    if (restored.schoolConfig) {
      setSchoolConfig(restored.schoolConfig);
      saveSchoolConfig(restored.schoolConfig);
    }
    if (Array.isArray(restored.students)) {
      setStudents(restored.students);
      saveStudentList(restored.students);
    }
    if (Array.isArray(restored.rombels)) {
      setRombels(restored.rombels);
      saveRombelList(restored.rombels);
    }
    if (Array.isArray(restored.users)) {
      setUsers(restored.users);
      saveUserList(restored.users);
    }
    if (Array.isArray(restored.attendanceRecords)) {
      setAttendanceRecords(restored.attendanceRecords);
      saveAttendanceRecords(restored.attendanceRecords);
    }
    if (Array.isArray(restored.tokens)) {
      setTokens(restored.tokens);
      saveTokens(restored.tokens);
    }
    if (Array.isArray(restored.teachers)) {
      setTeachers(restored.teachers);
      saveTeacherList(restored.teachers);
    }
    if (Array.isArray(restored.subjects)) {
      setSubjects(restored.subjects);
      saveSubjectList(restored.subjects);
    }
    if (Array.isArray(restored.schedules)) {
      setSchedules(restored.schedules);
      saveScheduleList(restored.schedules);
    }

    showToast('Menyinkronkan data pemulihan ke Cloud Database...', 'info');
    try {
      const ok = await firestoreRestoreFullBackup(restored);
      if (ok) {
        showToast('Data pemulihan berhasil disinkronkan ke Cloud & semua perangkat!', 'success');
      } else {
        showToast('Data pemulihan tersimpan di browser lokal.', 'info');
      }
    } catch (e) {
      console.error('Error syncing restore to cloud:', e);
    }
  };

  // Initial Cloud Sync Splash Screen for fresh devices
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/10 animate-pulse">
          <Building2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">SMK Bakti Putra Mandiri</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
          Menghubungkan ke Cloud Firestore dan menyelaraskan data sekolah...
        </p>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-300 bg-indigo-950/80 px-4 py-2 rounded-full border border-indigo-800/60 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Sinkronisasi otomatis multi-perangkat</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display dedicated Login Page
  if (!currentUser) {
    return (
      <>
        {toastNotice && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4 duration-200 ${
              toastNotice.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastNotice.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastNotice.message}</span>
          </div>
        )}
        <LoginPage
          users={users}
          schoolConfig={schoolConfig}
          onLoginSuccess={handleLoginSuccess}
          onOpenArchDocs={() => setIsArchDocsOpen(true)}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
        />
        {isArchDocsOpen && (
          <ArchitectureDocsModal
            isOpen={isArchDocsOpen}
            onClose={() => setIsArchDocsOpen(false)}
          />
        )}
        {isBackupModalOpen && (
          <DataBackupModal
            isOpen={isBackupModalOpen}
            onClose={() => setIsBackupModalOpen(false)}
            schoolConfig={schoolConfig}
            students={students}
            rombels={rombels}
            users={users}
            attendanceRecords={attendanceRecords}
            tokens={tokens}
            teachers={teachers}
            subjects={subjects}
            schedules={schedules}
            onDataRestored={handleDataRestored}
            onShowToast={showToast}
          />
        )}
      </>
    );
  }

  // Find linked student if current user is student
  const linkedStudent = currentUser.nipd
    ? students.find((s) => s.nipd === currentUser.nipd) || null
    : null;
  const linkedRombel = linkedStudent
    ? rombels.find((r) => r.id === linkedStudent.rombelId)
    : currentUser.rombelId
    ? rombels.find((r) => r.id === currentUser.rombelId)
    : undefined;

  // Compute Today's Overall Statistics
  const todayStr = getTodayDateStr();
  const todayRecords = attendanceRecords.filter((r) => r.tanggal === todayStr);
  const totalHadirToday = todayRecords.filter((r) => r.status === 'hadir').length;
  const totalSakitToday = todayRecords.filter((r) => r.status === 'sakit').length;
  const totalIzinToday = todayRecords.filter((r) => r.status === 'izin').length;
  const totalAlfaToday = todayRecords.filter((r) => r.status === 'alfa').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastNotice && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4 duration-200 ${
            toastNotice.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toastNotice.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotice.message}</span>
        </div>
      )}

      {/* Top Header & App Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 min-w-0">
            {schoolConfig.logoUrl ? (
              <img
                src={schoolConfig.logoUrl}
                alt="Logo Sekolah"
                className="w-10 h-10 object-contain rounded-xl bg-white/10 p-1 border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-lg text-white shrink-0">
                AP
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                  {schoolConfig.namaSekolah}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PRESENSI SISWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                Sistem Absensi QR Code NIPD, Token Mandiri & Rekap Persentase Otomatis
              </p>
            </div>
          </div>

          {/* Right Action Controls: Arch Docs, Settings, User Info */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Architecture Specs Button */}
            <button
              id="btn-open-arch-docs"
              onClick={() => setIsArchDocsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
              title="Lihat Arsitektur Sistem, Skema MySQL & Alur Logika"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Arsitektur & Skema SQL</span>
            </button>

            {/* School Settings & Backup Center (Admin only) */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  id="btn-open-school-settings"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Pengaturan Profil Sekolah & Logo"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  id="btn-open-backup-modal"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 hover:text-white transition cursor-pointer"
                  title="Pusat Cadangan & Pemulihan Database (Backup JSON)"
                >
                  <Database className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Cloud Real-Time Sync Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-300 shadow-xs"
              title="Data tersimpan & tersinkronisasi antar perangkat secara real-time via Firebase Firestore"
            >
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isCloudSynced ? 'Cloud Sync Aktif' : 'Menghubungkan Cloud...'}</span>
            </div>

            {/* Current User Badge & Profile Photo */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-emerald-700 flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 border border-slate-700">
                {currentUser.foto ? (
                  <img
                    src={currentUser.foto}
                    alt={currentUser.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.nama.slice(0, 2).toUpperCase()
                )}
                {userGreetingDetails?.isBirthday && (
                  <span
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-[8px] flex items-center justify-center rounded-full shadow-xs"
                    title="Ulang Tahun Hari Ini!"
                  >
                    🎂
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                  <span className="truncate max-w-[120px] md:max-w-[160px]">{currentUser.nama}</span>
                  {userGreetingDetails?.isBirthday && (
                    <button
                      type="button"
                      onClick={() => setShowBirthdayModal(true)}
                      className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-900 font-extrabold text-[9px] shadow-xs cursor-pointer flex items-center gap-0.5 animate-pulse"
                      title="Buka Kartu Ucapan Ulang Tahun"
                    >
                      <PartyPopper className="w-2.5 h-2.5" />
                      <span>Ultah!</span>
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="btn-header-logout"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-200 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              title="Keluar dari akun (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Bar (Tabs) */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-slate-700/80 hover:scrollbar-thumb-slate-600">
            <nav className="flex items-center gap-1 sm:gap-1.5 min-w-max">
              {currentUser.role !== 'siswa' ? (
                <>
                  <button
                    id="tab-nav-attendance"
                    onClick={() => setActiveTab('attendance')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'attendance'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Presensi Per Kelas
                  </button>

                  {/* TAB: CRUD & Koreksi Absen (Admin & Walas/Guru) */}
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      id="tab-nav-manage-attendance"
                      onClick={() => setActiveTab('manage_attendance')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'manage_attendance'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title="Pusat kelola & koreksi presensi untuk meminimalisir kesalahan absen"
                    >
                      <ClipboardEdit className="w-4 h-4 text-indigo-400" />
                      Koreksi & CRUD Absen
                    </button>
                  )}

                  <button
                    id="tab-nav-students"
                    onClick={() => setActiveTab('students')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'students'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Data Siswa ({students.length})
                  </button>

                  {/* TAB: CRUD Akun Siswa (Admin, Walas, Guru) */}
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      id="tab-nav-student-accounts"
                      onClick={() => setActiveTab('student_accounts')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'student_accounts'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Akun Siswa ({users.filter((u) => u.role === 'siswa').length})
                    </button>
                  )}

                  {/* TAB: CRUD Data Guru (Admin & Guru) */}
                  {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
                    <button
                      id="tab-nav-teachers"
                      onClick={() => setActiveTab('teachers')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'teachers'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Data Guru ({teachers.length})
                    </button>
                  )}

                  {/* TAB: CRUD Jadwal & Mapel */}
                  <button
                    id="tab-nav-schedules"
                    onClick={() => setActiveTab('schedules')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'schedules'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Jadwal & Mapel ({subjects.length})
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      id="tab-nav-rombel"
                      onClick={() => setActiveTab('rombel')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'rombel'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Kelola Rombel ({rombels.length})
                    </button>
                  )}

                  {/* TAB: Kelola Seluruh Akun Pengguna */}
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      id="tab-nav-users"
                      onClick={() => setActiveTab('users')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'users'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Akun Pengguna ({users.length})
                    </button>
                  )}

                  {(currentUser.role === 'admin' || currentUser.role === 'guru' || currentUser.role === 'walas') && (
                    <button
                      id="tab-nav-reports"
                      onClick={() => setActiveTab('reports')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        activeTab === 'reports'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Cetak Laporan
                    </button>
                  )}

                  {/* Student Portal Navigation Button for Officer & Admin/Guru */}
                  <button
                    id="tab-nav-student-preview"
                    onClick={() => setActiveTab('student_portal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      activeTab === 'student_portal'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {currentUser.role === 'ketua_kelas' || currentUser.role === 'sekretaris'
                      ? 'Portal Siswa Saya'
                      : 'Pratinjau Portal Siswa'}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    id="tab-nav-student-portal"
                    onClick={() => setActiveTab('student_portal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === 'student_portal'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Portal Siswa Saya
                  </button>
                  <button
                    id="tab-nav-student-schedules"
                    onClick={() => setActiveTab('schedules')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === 'schedules'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Jadwal Pelajaran
                  </button>
                </div>
              )}
            </nav>

            {/* Quick Action: Live Camera Scanner Trigger */}
            {currentUser.role !== 'siswa' && (
              <div className="flex items-center gap-2 pl-3 shrink-0">
                <button
                  id="btn-topbar-open-scanner"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Kamera Scanner QR</span>
                </button>

                {(currentUser.role === 'admin' ||
                  currentUser.role === 'guru' ||
                  currentUser.role === 'walas' ||
                  currentUser.role === 'ketua_kelas' ||
                  currentUser.role === 'sekretaris') && (
                  <button
                    id="btn-topbar-open-token"
                    onClick={() => setIsTokenManagerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Token Presensi</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-700 flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 border border-slate-700">
                {currentUser.foto ? (
                  <img
                    src={currentUser.foto}
                    alt={currentUser.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.nama.slice(0, 2).toUpperCase()
                )}
                {userGreetingDetails?.isBirthday && (
                  <span className="absolute -top-1 -right-1 text-xs">🎂</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.nama}</div>
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              {userGreetingDetails?.isBirthday && (
                <button
                  type="button"
                  onClick={() => {
                    setShowBirthdayModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900 font-bold text-[10px] shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <PartyPopper className="w-3 h-3" />
                  <span>Ultah!</span>
                </button>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 pb-2 border-b border-slate-800">
              {currentUser.role !== 'siswa' ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('attendance');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Presensi Per Kelas
                  </button>
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      onClick={() => {
                        setActiveTab('manage_attendance');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'manage_attendance' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <ClipboardEdit className="w-4 h-4 text-indigo-400" />
                      Koreksi & CRUD Absen
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab('students');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'students' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Data Siswa ({students.length})
                  </button>
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      onClick={() => {
                        setActiveTab('student_accounts');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'student_accounts' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Akun Siswa
                    </button>
                  )}
                  {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
                    <button
                      onClick={() => {
                        setActiveTab('teachers');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'teachers' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Data Guru ({teachers.length})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab('schedules');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'schedules' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Jadwal & Mapel
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('rombel');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'rombel' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Kelola Rombel
                    </button>
                  )}
                  {(currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
                    <button
                      onClick={() => {
                        setActiveTab('users');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Akun Pengguna
                    </button>
                  )}
                  {(currentUser.role === 'admin' || currentUser.role === 'guru' || currentUser.role === 'walas') && (
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeTab === 'reports' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Cetak Laporan
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('student_portal');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'student_portal' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Portal Siswa Saya
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('schedules');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'schedules' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Jadwal Pelajaran
                  </button>
                </>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsArchDocsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Arsitektur Sistem & Skema MySQL
              </button>
              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Pengaturan Profil Sekolah & Logo
                  </button>
                  <button
                    onClick={() => {
                      setIsBackupModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Pusat Cadangan & Pemulihan Data (Backup JSON)
                  </button>
                </>
              )}
              <button
                id="btn-mobile-logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Sesi (Logout)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Greeting Banner (upon login or dismissing) */}
        {welcomeGreetingBanner && welcomeGreetingBanner.show && (
          <div className="mb-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/40 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3.5">
              <span className="text-2xl sm:text-3xl p-2.5 bg-white/10 rounded-2xl shrink-0 backdrop-blur-xs">
                {welcomeGreetingBanner.icon}
              </span>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-emerald-200">
                  {welcomeGreetingBanner.title}
                </div>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  {welcomeGreetingBanner.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWelcomeGreetingBanner(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition text-xs cursor-pointer shrink-0"
              title="Tutup Sapaan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: Class Attendance Tab */}
        {activeTab === 'attendance' && (
          <ClassAttendanceTab
            currentUser={currentUser}
            rombels={rombels}
            students={students}
            attendanceRecords={attendanceRecords}
            onUpdateAttendance={handleUpdateSingleAttendance}
            onResetAttendance={handleResetStudentAttendance}
            onBulkResetAttendance={handleBulkResetAttendance}
            onSaveRecord={handleSaveAttendanceRecord}
            onEditAttendanceRecord={() => setActiveTab('manage_attendance')}
            onBulkUpdateAttendance={handleBulkUpdateAttendance}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenTokenManager={() => setIsTokenManagerOpen(true)}
            onSelectStudentCard={(student) => setSelectedStudentForCard(student)}
            onNavigateToCrud={() => setActiveTab('manage_attendance')}
            schoolConfig={schoolConfig}
          />
        )}

        {/* TAB 1B: Manage Attendance Master Tab (CRUD & Koreksi Presensi Admin) */}
        {activeTab === 'manage_attendance' && (currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
          <ManageAttendanceTab
            currentUser={currentUser}
            students={students}
            rombels={rombels}
            attendanceRecords={attendanceRecords}
            onSaveRecord={handleSaveAttendanceRecord}
            onDeleteRecord={handleDeleteAttendanceRecord}
            onBatchDeleteRecords={handleBatchDeleteAttendanceRecords}
            onResetStudentAttendance={handleResetStudentAttendance}
            schoolConfig={schoolConfig}
          />
        )}

        {/* TAB 2: Manage Students Master Tab */}
        {activeTab === 'students' && (
          <ManageStudentsTab
            currentUser={currentUser}
            students={students}
            rombels={rombels}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onSelectStudentCard={(student) => setSelectedStudentForCard(student)}
          />
        )}

        {/* TAB 2B: CRUD Akun Siswa (Dedicated Student Accounts CRUD) */}
        {activeTab === 'student_accounts' && (currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
          <ManageStudentAccountsTab
            currentUser={currentUser}
            users={users}
            students={students}
            rombels={rombels}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateStudent={handleUpdateStudent}
            onSyncMassStudentAccounts={(updatedList) => {
              setUsers(updatedList);
              saveUserList(updatedList);
              firestoreSaveUsersBatch(updatedList);
            }}
            onShowToast={showToast}
          />
        )}

        {/* TAB 2C: CRUD Data Guru (Master Guru CRUD) */}
        {activeTab === 'teachers' && (currentUser.role === 'admin' || currentUser.role === 'guru') && (
          <ManageTeachersTab
            currentUser={currentUser}
            teachers={teachers}
            subjects={subjects}
            rombels={rombels}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        )}

        {/* TAB 2D: CRUD Jadwal & Mata Pelajaran */}
        {activeTab === 'schedules' && (
          <ManageSubjectsAndScheduleTab
            currentUser={currentUser}
            subjects={subjects}
            schedules={schedules}
            teachers={teachers}
            rombels={rombels}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {/* TAB 3: Manage Rombels Tab */}
        {activeTab === 'rombel' && currentUser.role === 'admin' && (
          <ManageRombelTab
            currentUser={currentUser}
            rombels={rombels}
            students={students}
            onAddRombel={handleAddRombel}
            onUpdateRombel={handleUpdateRombel}
            onDeleteRombel={handleDeleteRombel}
          />
        )}

        {/* TAB 4: Manage Users & Accounts Tab (CRUD Pengguna & Koreksi Nama) */}
        {activeTab === 'users' && (currentUser.role === 'admin' || currentUser.role === 'walas' || currentUser.role === 'guru') && (
          <ManageUsersTab
            currentUser={currentUser}
            users={users}
            students={students}
            rombels={rombels}
            teachers={teachers}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateStudent={handleUpdateStudent}
            onUpdateTeacher={handleUpdateTeacher}
            onSyncMassStudentAccounts={(updatedList) => {
              setUsers(updatedList);
              saveUserList(updatedList);
              firestoreSaveUsersBatch(updatedList);
            }}
            onShowToast={showToast}
          />
        )}

        {/* TAB 5: Reports & Printing Tab */}
        {activeTab === 'reports' && (currentUser.role === 'admin' || currentUser.role === 'guru' || currentUser.role === 'walas') && (
          <ReportsPrintTab
            currentUser={currentUser}
            students={students}
            rombels={rombels}
            attendanceRecords={attendanceRecords}
            schoolConfig={schoolConfig}
          />
        )}

        {/* TAB 6: Student Portal Tab */}
        {activeTab === 'student_portal' && (
          <StudentPortalTab
            currentUser={currentUser}
            student={linkedStudent || students[0]}
            rombel={linkedRombel || rombels[0]}
            attendanceRecords={attendanceRecords}
            activeTokens={tokens}
            onTokenCheckIn={handleStudentTokenCheckIn}
            onUpdateCurrentUser={handleUpdateUser}
            onSelectStudentCard={(student) => setSelectedStudentForCard(student)}
            schoolConfig={schoolConfig}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} {schoolConfig.namaSekolah}. Sistem Presensi Siswa Real-time Berbasis QR Code & NIPD.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Formula: (Hadir / Hari Efektif) × 100%</span>
            <span>•</span>
            <button
              onClick={() => setIsArchDocsOpen(true)}
              className="text-emerald-600 hover:underline font-semibold"
            >
              Dokumentasi Arsitektur
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Camera QR Scanner Modal */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleQRScanned}
          students={students}
          rombels={rombels}
        />
      )}

      {/* 2. Token Manager Modal */}
      {isTokenManagerOpen && (
        <TokenManagerModal
          isOpen={isTokenManagerOpen}
          onClose={() => setIsTokenManagerOpen(false)}
          currentUser={currentUser}
          rombels={rombels}
          tokens={tokens}
          activeTokens={tokens}
          onAddToken={handleCreateToken}
          onCreateToken={handleCreateToken}
          onRevokeToken={handleDeleteToken}
          onDeleteToken={handleDeleteToken}
        />
      )}

      {/* 3. Digital Student Card Modal */}
      {selectedStudentForCard && (
        <StudentCardModal
          student={selectedStudentForCard}
          rombel={rombels.find((r) => r.id === selectedStudentForCard.rombelId)}
          schoolConfig={schoolConfig}
          onClose={() => setSelectedStudentForCard(null)}
        />
      )}

      {/* 4. School Settings Modal */}
      {isSettingsOpen && (
        <SchoolSettingsModal
          config={schoolConfig}
          onSave={(newConf) => handleSaveSchoolConfig(newConf)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 5. Data Backup & Restore Modal */}
      {isBackupModalOpen && (
        <DataBackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          schoolConfig={schoolConfig}
          students={students}
          rombels={rombels}
          users={users}
          attendanceRecords={attendanceRecords}
          tokens={tokens}
          teachers={teachers}
          subjects={subjects}
          schedules={schedules}
          onDataRestored={handleDataRestored}
          onShowToast={showToast}
        />
      )}

      {/* 6. Architecture & MySQL DDL Docs Modal */}
      {isArchDocsOpen && (
        <ArchitectureDocsModal
          isOpen={isArchDocsOpen}
          onClose={() => setIsArchDocsOpen(false)}
        />
      )}

      {/* 7. Birthday Celebration Modal */}
      {showBirthdayModal && currentUser && (
        <BirthdayCelebrationModal
          user={currentUser}
          student={matchedStudentForUser}
          age={userGreetingDetails?.age}
          birthdayWish={userGreetingDetails?.birthdayWish}
          onClose={() => setShowBirthdayModal(false)}
        />
      )}
    </div>
  );
}
