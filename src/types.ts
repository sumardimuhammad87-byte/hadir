export type UserRole = 'admin' | 'guru' | 'staf' | 'walas' | 'ketua_kelas' | 'sekretaris' | 'siswa';

export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alfa';

export type AttendanceMethod = 'qr_scan' | 'token' | 'manual_admin' | 'manual_guru' | 'manual_pengurus';

export interface Student {
  nipd: string;        // Primary Key, e.g. "26.27.10.002"
  nisn: string;        // e.g. "0117573036"
  nama: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  rombelId: string;    // Foreign Key to Class/Rombel
  foto?: string;
  statusAktif: boolean;
}

export interface Rombel {
  id: string;          // e.g. "X", "XI-FAR", "XI-KEP", "XII-FAR", "XII-KEP"
  nama: string;        // e.g. "Kelas X", "Kelas XI Asisten Farmasi"
  tingkat: 'X' | 'XI' | 'XII';
  jurusan: string;     // e.g. "Umum", "Asisten Farmasi", "Asisten Keperawatan"
  waliKelasNama?: string;
  waliKelasNip?: string;
  ketuaKelasNipd?: string;
  sekretarisNipd?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  nama: string;
  role: UserRole;
  password?: string;
  nipd?: string;       // For student / class officers
  rombelId?: string;   // For walas, ketua_kelas, sekretaris, siswa
  jabatan?: string;
  foto?: string;
  telepon?: string;
  statusAktif: boolean;
}

export interface AttendanceRecord {
  id: string;
  nipd: string;        // Foreign key to student
  rombelId: string;
  tanggal: string;     // YYYY-MM-DD
  waktu: string;       // HH:mm:ss
  status: AttendanceStatus;
  metode: AttendanceMethod;
  recordedByRole: UserRole;
  recordedByName: string;
  keterangan?: string;
  tokenUsed?: string;
}

export interface AttendanceToken {
  id: string;
  token: string;       // 6-digit code, e.g. "ABS-7429"
  rombelId: string;    // Target rombel or "ALL"
  createdBy: string;
  createdRole: UserRole;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface SchoolConfig {
  namaSekolah: string;
  alamatSekolah: string;
  kelurahan: string;
  kecamatan: string;
  kotaKab: string;
  provinsi: string;
  telepon: string;
  email: string;
  website: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl: string;
  jamMasuk: string;     // e.g. "07:00"
  jamBatasMasuk: string; // e.g. "07:30"
  totalHariEfektifSemester: number; // e.g. 100 or 120
  hariSekolahPerminggu?: 5 | 6; // 5 = Senin-Jumat (Sabtu & Minggu libur), 6 = Senin-Sabtu
  hariLiburKhusus?: { tanggal: string; nama: string; keterangan?: string }[]; // Libur khusus sekolah
}

export interface Teacher {
  id: string;          // e.g. "GUR-001"
  nip: string;         // NIP or NUPTK, e.g. "19820315 200604 1 008"
  nama: string;        // Full name with title, e.g. "Budi Santoso, S.Pd."
  jk: 'L' | 'P';
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT' | 'GTY' | 'Honorer';
  mataPelajaran: string[]; // List of subject names or IDs taught
  rombelWaliKelasId?: string; // Optional: foreign key to Rombel if wali kelas
  telepon: string;     // WhatsApp / Phone
  email: string;
  foto?: string;
  statusAktif: boolean;
}

export type SubjectGroup =
  | 'Muatan Nasional (A)'
  | 'Muatan Kewilayahan (B)'
  | 'Peminatan Kejuruan (C)'
  | 'Muatan Lokal';

export interface Subject {
  id: string;          // e.g. "MAPEL-FAR-01"
  kode: string;        // e.g. "FAR-01", "MTK", "KDM"
  nama: string;        // e.g. "Farmakologi & Toksikologi"
  kelompok: SubjectGroup;
  tingkat: 'Semua' | 'X' | 'XI' | 'XII';
  jurusan?: string;    // e.g. "Semua", "Farmasi", "Keperawatan"
  jamPerMinggu: number;// e.g. 2, 3, 4 JP
  statusAktif: boolean;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface ScheduleItem {
  id: string;          // e.g. "SCH-001"
  rombelId: string;    // Foreign key to Rombel
  hari: DayOfWeek;
  jamKe: string;       // e.g. "1 - 2 (07:00 - 08:30)"
  jamMulai: string;    // e.g. "07:00"
  jamSelesai: string;  // e.g. "08:30"
  subjectId: string;   // Foreign key to Subject
  teacherId: string;   // Foreign key to Teacher
  ruangan: string;     // e.g. "Ruang Kelas X", "Lab Farmasi", "Lab Keperawatan"
  keterangan?: string;
}

