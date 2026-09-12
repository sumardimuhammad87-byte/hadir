import { Student, Rombel, UserAccount, SchoolConfig, AttendanceRecord, AttendanceToken, AttendanceStatus, AttendanceMethod, UserRole, Teacher, Subject, ScheduleItem } from '../types';
import { INITIAL_SCHOOL_CONFIG, INITIAL_ROMBEL, INITIAL_STUDENTS, INITIAL_USERS, INITIAL_TEACHERS, INITIAL_SUBJECTS, INITIAL_SCHEDULES, generateInitialAttendance } from '../data/initialData';

const KEYS = {
  CONFIG: 'absensi_school_config_v1',
  ROMBEL: 'absensi_rombel_v1',
  STUDENTS: 'absensi_students_v1',
  USERS: 'absensi_users_v1',
  ATTENDANCE: 'absensi_records_v1',
  TOKENS: 'absensi_tokens_v1',
  CURRENT_USER: 'absensi_current_user_v1',
  TEACHERS: 'absensi_teachers_v1',
  SUBJECTS: 'absensi_subjects_v1',
  SCHEDULES: 'absensi_schedules_v1',
};

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeStr(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Safe Storage Wrapper to prevent QuotaExceededError or unhandled storage crashes
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[Storage Warning] Gagal menyimpan key "${key}":`, err?.message || err);

    // Try cleaning expired tokens or redundant session data to free up space, never corrupting user data
    try {
      localStorage.removeItem(KEYS.CURRENT_USER);
      localStorage.removeItem(KEYS.TOKENS);
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

// 1. School Config
export function loadSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.namaSekolah) {
        // Automatically migrate if saved with previous default name
        if (
          parsed.namaSekolah === 'SMK KESEHATAN BHAKTI HUSADA' ||
          parsed.namaSekolah.toLowerCase().includes('bhakti husada')
        ) {
          parsed.namaSekolah = 'SMK Bakti Putra Mandiri';
          if (parsed.email && parsed.email.includes('husada')) {
            parsed.email = 'info@smkbaktiputramandiri.sch.id';
          }
          if (parsed.website && parsed.website.includes('husada')) {
            parsed.website = 'www.smkbaktiputramandiri.sch.id';
          }
          saveSchoolConfig(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat SchoolConfig:', e);
  }
  return INITIAL_SCHOOL_CONFIG;
}

export function saveSchoolConfig(config: SchoolConfig): void {
  safeSetItem(KEYS.CONFIG, JSON.stringify(config));
}

// 2. Rombel
export function loadRombelList(): Rombel[] {
  try {
    const raw = localStorage.getItem(KEYS.ROMBEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat RombelList:', e);
  }
  return INITIAL_ROMBEL;
}

export function saveRombelList(list: Rombel[]): void {
  safeSetItem(KEYS.ROMBEL, JSON.stringify(list));
}

// 3. Students
export function loadStudentList(): Student[] {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat StudentList:', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudentList(list: Student[]): void {
  safeSetItem(KEYS.STUDENTS, JSON.stringify(list));
}

// 4. Users
export function loadUserList(): UserAccount[] {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat UserList:', e);
  }
  return INITIAL_USERS;
}

export function saveUserList(list: UserAccount[]): void {
  safeSetItem(KEYS.USERS, JSON.stringify(list));
}

// Helper: Ensure a student has an active UserAccount for instant login
export function ensureStudentUserAccount(
  student: Student,
  existingUsers: UserAccount[]
): { updatedUsers: UserAccount[]; createdUser: UserAccount } {
  const cleanNipd = student.nipd.trim();
  const existingIdx = existingUsers.findIndex(
    (u) => (u.nipd && u.nipd.trim() === cleanNipd) || u.username === cleanNipd
  );

  if (existingIdx >= 0) {
    // Update existing user info
    const updated = [...existingUsers];
    updated[existingIdx] = {
      ...updated[existingIdx],
      nama: student.nama,
      rombelId: student.rombelId,
      statusAktif: student.statusAktif ?? true,
    };
    saveUserList(updated);
    return { updatedUsers: updated, createdUser: updated[existingIdx] };
  }

  // Create brand new login account for this student
  const newUser: UserAccount = {
    id: `USR-STD-${cleanNipd.replace(/[^a-zA-Z0-9]/g, '')}`,
    email: `${cleanNipd.replace(/[^a-zA-Z0-9]/g, '')}@siswa.sch.id`,
    username: cleanNipd,
    nama: student.nama,
    role: 'siswa',
    password: '123', // Default PIN for student
    nipd: cleanNipd,
    rombelId: student.rombelId,
    jabatan: 'Siswa',
    statusAktif: true,
  };

  const updated = [newUser, ...existingUsers];
  saveUserList(updated);
  return { updatedUsers: updated, createdUser: newUser };
}

// Helper: Remove student user account if student is deleted
export function removeStudentUserAccount(
  nipd: string,
  existingUsers: UserAccount[]
): UserAccount[] {
  const clean = nipd.trim();
  const filtered = existingUsers.filter(
    (u) => !(u.role === 'siswa' && (u.nipd === clean || u.username === clean))
  );
  saveUserList(filtered);
  return filtered;
}

// Mass generate student accounts from existing student records
export function generateMassStudentAccounts(students: Student[], existingUsers: UserAccount[]): { updatedUsers: UserAccount[]; countAdded: number } {
  let countAdded = 0;
  const userMap = new Map<string, UserAccount>();
  existingUsers.forEach(u => {
    if (u.nipd) userMap.set(u.nipd, u);
    else userMap.set(u.id, u);
  });

  students.forEach(std => {
    if (!userMap.has(std.nipd)) {
      countAdded++;
      const newUser: UserAccount = {
        id: `USR-STD-${std.nipd.replace(/[^a-zA-Z0-9]/g, '')}`,
        email: `${std.nipd.replace(/[^a-zA-Z0-9]/g, '')}@siswa.sch.id`,
        username: std.nipd,
        nama: std.nama,
        role: 'siswa',
        password: '123', // default PIN / password for student
        nipd: std.nipd,
        rombelId: std.rombelId,
        jabatan: `Siswa`,
        statusAktif: true,
      };
      userMap.set(std.nipd, newUser);
    }
  });

  const updatedUsers = Array.from(userMap.values());
  saveUserList(updatedUsers);
  return { updatedUsers, countAdded };
}

// 5. Attendance
export function loadAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Initialize with today's demo attendance for 77 students
  const today = getTodayDateStr();
  const seed = generateInitialAttendance(INITIAL_STUDENTS, today);
  saveAttendanceRecords(seed);
  return seed;
}

export function saveAttendanceRecords(list: AttendanceRecord[]): void {
  safeSetItem(KEYS.ATTENDANCE, JSON.stringify(list));
}

// 6. Active Tokens
export function loadTokens(): AttendanceToken[] {
  try {
    const raw = localStorage.getItem(KEYS.TOKENS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'TOK-DEMO-1',
      token: 'ABS-7429',
      rombelId: 'ALL',
      createdBy: 'Guru Piket',
      createdRole: 'guru',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      isActive: true,
    }
  ];
}

export function saveTokens(tokens: AttendanceToken[]): void {
  safeSetItem(KEYS.TOKENS, JSON.stringify(tokens));
}

// 7. Session User
export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (raw) {
      if (raw === 'null' || raw === 'undefined') return null;
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  // Return null so login page is displayed if not authenticated
  return null;
}

export function saveCurrentUser(user: UserAccount | null): void {
  if (!user) {
    try {
      localStorage.removeItem(KEYS.CURRENT_USER);
    } catch {}
  } else {
    safeSetItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// Helper: Calculate attendance percentage
export function calculateAttendanceRate(hadirCount: number, effectiveDays: number): number {
  if (effectiveDays <= 0) return 100;
  const rate = (hadirCount / effectiveDays) * 100;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
}

// Record or update attendance for a student on a specific date (defaults to today)
export function recordAttendance(
  nipd: string,
  rombelId: string,
  status: AttendanceStatus,
  metode: AttendanceMethod,
  recordedByRole: UserRole,
  recordedByName: string,
  tokenUsed?: string,
  keterangan?: string,
  targetDate?: string,
  targetTime?: string
): AttendanceRecord[] {
  const currentRecords = loadAttendanceRecords();
  const dateStr = targetDate || getTodayDateStr();
  const timeStr = targetTime || getCurrentTimeStr();

  const existingIndex = currentRecords.findIndex(
    (r) => r.nipd === nipd && r.tanggal === dateStr
  );

  const updatedRecord: AttendanceRecord = {
    id: existingIndex >= 0 ? currentRecords[existingIndex].id : `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    nipd,
    rombelId,
    tanggal: dateStr,
    waktu: timeStr,
    status,
    metode,
    recordedByRole,
    recordedByName,
    tokenUsed,
    keterangan,
  };

  let nextRecords: AttendanceRecord[];
  if (existingIndex >= 0) {
    nextRecords = [...currentRecords];
    nextRecords[existingIndex] = updatedRecord;
  } else {
    nextRecords = [updatedRecord, ...currentRecords];
  }

  saveAttendanceRecords(nextRecords);
  return nextRecords;
}

// Save or overwrite a single attendance record directly (e.g. from Admin CRUD modal)
export function saveAttendanceRecordDirect(record: AttendanceRecord): AttendanceRecord[] {
  const currentRecords = loadAttendanceRecords();
  // Filter out any existing record with the same ID, or same student and date (to prevent duplicates if date was modified)
  const filtered = currentRecords.filter(
    (r) => r.id !== record.id && !(r.nipd === record.nipd && r.tanggal === record.tanggal)
  );
  const nextRecords = [record, ...filtered];
  saveAttendanceRecords(nextRecords);
  return nextRecords;
}

// Delete an attendance record by ID (e.g. from Admin CRUD)
export function deleteAttendanceRecord(recordId: string): AttendanceRecord[] {
  const currentRecords = loadAttendanceRecords();
  const filtered = currentRecords.filter((r) => r.id !== recordId);
  saveAttendanceRecords(filtered);
  return filtered;
}

// Delete attendance record by student NIPD and date (Resets student to 'Belum Absen')
export function deleteAttendanceByStudentAndDate(nipd: string, tanggal: string): AttendanceRecord[] {
  const currentRecords = loadAttendanceRecords();
  const filtered = currentRecords.filter((r) => !(r.nipd === nipd && r.tanggal === tanggal));
  saveAttendanceRecords(filtered);
  return filtered;
}

// Delete multiple attendance records in batch
export function deleteAttendanceRecordsBatch(recordIds: string[]): AttendanceRecord[] {
  const idSet = new Set(recordIds);
  const currentRecords = loadAttendanceRecords();
  const filtered = currentRecords.filter((r) => !idSet.has(r.id));
  saveAttendanceRecords(filtered);
  return filtered;
}

// Student Self Check-in with Token validation
export function validateTokenAndCheckIn(
  tokenCode: string,
  student: Student,
  user: UserAccount
): { success: boolean; message: string } {
  const tokens = loadTokens();
  const cleanCode = tokenCode.trim().toUpperCase();

  const matchedToken = tokens.find(
    (t) => t.token.toUpperCase() === cleanCode && t.isActive
  );

  if (!matchedToken) {
    return { success: false, message: 'Kode token tidak ditemukan atau sudah dinonaktifkan!' };
  }

  const now = new Date().getTime();
  const expireTime = new Date(matchedToken.expiresAt).getTime();
  if (now > expireTime) {
    return { success: false, message: 'Masa berlaku token telah habis/kedaluwarsa!' };
  }

  // Check target class
  if (matchedToken.rombelId !== 'ALL' && matchedToken.rombelId !== student.rombelId) {
    return { success: false, message: 'Token ini khusus untuk kelas lain, bukan rombel Anda!' };
  }

  // Record presence
  recordAttendance(
    student.nipd,
    student.rombelId,
    'hadir',
    'token',
    'siswa',
    user.nama,
    matchedToken.token,
    `Presensi mandiri via token ${matchedToken.token}`
  );

  return {
    success: true,
    message: `Presensi berhasil! Anda tercatat HADIR hari ini pukul ${getCurrentTimeStr()}.`,
  };
}

// Reset all storage to pristine seed state
export function resetAllData(): void {
  try {
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.ROMBEL);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.TOKENS);
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.TEACHERS);
    localStorage.removeItem(KEYS.SUBJECTS);
    localStorage.removeItem(KEYS.SCHEDULES);
  } catch (e) {
    console.error(e);
  }
}

// 8. Teachers (Data Guru)
export function loadTeacherList(): Teacher[] {
  try {
    const raw = localStorage.getItem(KEYS.TEACHERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat TeacherList:', e);
  }
  return INITIAL_TEACHERS;
}

export function saveTeacherList(list: Teacher[]): void {
  safeSetItem(KEYS.TEACHERS, JSON.stringify(list));
}

// Helper: Ensure a Teacher has an active UserAccount
export function ensureTeacherUserAccount(
  teacher: Teacher,
  existingUsers: UserAccount[]
): { updatedUsers: UserAccount[]; createdUser: UserAccount } {
  const cleanNip = teacher.nip.replace(/\s+/g, '');
  const existingIdx = existingUsers.findIndex(
    (u) => u.id === `USR-GUR-${teacher.id}` || (u.email && u.email.toLowerCase() === teacher.email.toLowerCase())
  );

  if (existingIdx >= 0) {
    const updated = [...existingUsers];
    updated[existingIdx] = {
      ...updated[existingIdx],
      nama: teacher.nama,
      email: teacher.email,
      telepon: teacher.telepon,
      rombelId: teacher.rombelWaliKelasId,
      role: teacher.rombelWaliKelasId ? 'walas' : 'guru',
      jabatan: teacher.rombelWaliKelasId ? 'Wali Kelas & Guru Pengajar' : 'Guru Pengajar',
      statusAktif: teacher.statusAktif,
    };
    saveUserList(updated);
    return { updatedUsers: updated, createdUser: updated[existingIdx] };
  }

  const newUser: UserAccount = {
    id: `USR-GUR-${teacher.id}`,
    email: teacher.email,
    username: cleanNip || teacher.id.toLowerCase(),
    nama: teacher.nama,
    role: teacher.rombelWaliKelasId ? 'walas' : 'guru',
    password: 'guru123',
    rombelId: teacher.rombelWaliKelasId,
    jabatan: teacher.rombelWaliKelasId ? 'Wali Kelas & Guru Pengajar' : 'Guru Pengajar',
    telepon: teacher.telepon,
    statusAktif: teacher.statusAktif,
  };

  const updated = [newUser, ...existingUsers];
  saveUserList(updated);
  return { updatedUsers: updated, createdUser: newUser };
}

// Remove teacher login account
export function removeTeacherUserAccount(
  email?: string,
  nip?: string,
  existingUsers: UserAccount[] = []
): UserAccount[] {
  const cleanEmail = email?.toLowerCase().trim();
  const cleanNip = nip?.replace(/\s+/g, '');
  const filtered = existingUsers.filter((u) => {
    if (u.role === 'admin') return true;
    if (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) return false;
    if (cleanNip && u.username && u.username === cleanNip) return false;
    return true;
  });
  saveUserList(filtered);
  return filtered;
}

// 9. Subjects (Mata Pelajaran)
export function loadSubjectList(): Subject[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat SubjectList:', e);
  }
  return INITIAL_SUBJECTS;
}

export function saveSubjectList(list: Subject[]): void {
  safeSetItem(KEYS.SUBJECTS, JSON.stringify(list));
}

// 10. Schedules (Jadwal Pelajaran)
export function loadScheduleList(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(KEYS.SCHEDULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[Storage] Gagal memuat ScheduleList:', e);
  }
  return INITIAL_SCHEDULES;
}

export function saveScheduleList(list: ScheduleItem[]): void {
  safeSetItem(KEYS.SCHEDULES, JSON.stringify(list));
}

export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  schoolConfig: SchoolConfig;
  rombels: Rombel[];
  students: Student[];
  users: UserAccount[];
  attendanceRecords: AttendanceRecord[];
  tokens: AttendanceToken[];
  teachers?: Teacher[];
  subjects?: Subject[];
  schedules?: ScheduleItem[];
}

// Export entire system data to portable JSON backup
export function exportFullDatabaseBackup(): string {
  const payload: FullBackupPayload = {
    version: '1.2',
    exportedAt: new Date().toISOString(),
    schoolConfig: loadSchoolConfig(),
    rombels: loadRombelList(),
    students: loadStudentList(),
    users: loadUserList(),
    attendanceRecords: loadAttendanceRecords(),
    tokens: loadTokens(),
    teachers: loadTeacherList(),
    subjects: loadSubjectList(),
    schedules: loadScheduleList(),
  };
  return JSON.stringify(payload, null, 2);
}

// Restore entire system data from JSON backup
export function importFullDatabaseBackup(rawJson: string): {
  success: boolean;
  message: string;
  data?: FullBackupPayload;
} {
  try {
    const parsed = JSON.parse(rawJson) as FullBackupPayload;
    if (!parsed || !parsed.schoolConfig || !Array.isArray(parsed.students)) {
      return {
        success: false,
        message: 'Format berkas cadangan JSON tidak valid atau rusak.',
      };
    }

    if (parsed.schoolConfig) saveSchoolConfig(parsed.schoolConfig);
    if (Array.isArray(parsed.rombels)) saveRombelList(parsed.rombels);
    if (Array.isArray(parsed.students)) saveStudentList(parsed.students);
    if (Array.isArray(parsed.users)) saveUserList(parsed.users);
    if (Array.isArray(parsed.attendanceRecords)) saveAttendanceRecords(parsed.attendanceRecords);
    if (Array.isArray(parsed.tokens)) saveTokens(parsed.tokens);
    if (Array.isArray(parsed.teachers)) saveTeacherList(parsed.teachers);
    if (Array.isArray(parsed.subjects)) saveSubjectList(parsed.subjects);
    if (Array.isArray(parsed.schedules)) saveScheduleList(parsed.schedules);

    return {
      success: true,
      message: `Cadangan berhasil dipulihkan! ${parsed.students.length} siswa, ${parsed.teachers?.length || 0} guru, dan ${parsed.users?.length || 0} akun pengguna telah disinkronkan.`,
      data: parsed,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Gagal membaca berkas: ${e?.message || 'Format JSON tidak valid'}`,
    };
  }
}
