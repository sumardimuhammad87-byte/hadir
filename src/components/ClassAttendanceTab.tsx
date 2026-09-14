import React, { useState } from 'react';
import {
  Student,
  Rombel,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceMethod,
  UserAccount,
  SchoolConfig,
} from '../types';
import { getCurrentTimeStr, getTodayDateStr } from '../utils/storage';
import { getHolidayInfo, formatIndonesianDateWithDay } from '../utils/holidays';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Key,
  Search,
  UserCheck,
  Calendar,
  ShieldCheck,
  Filter,
  Award,
  Shield,
  User,
  Users,
  Sparkles,
  Lock,
  RotateCcw,
  Edit,
  ClipboardEdit,
  X,
  Save,
} from 'lucide-react';

interface ClassAttendanceTabProps {
  currentUser: UserAccount;
  students: Student[];
  rombels: Rombel[];
  attendanceRecords: AttendanceRecord[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onUpdateAttendance: (nipd: string, status: AttendanceStatus, keterangan?: string, targetDate?: string, targetTime?: string) => void;
  onResetAttendance?: (nipd: string, targetDate: string) => void;
  onSaveRecord?: (record: AttendanceRecord) => void;
  onEditAttendanceRecord?: (record: AttendanceRecord) => void;
  onBulkUpdateAttendance?: (nipds: string[], status: AttendanceStatus, targetDate?: string) => void;
  onBulkResetAttendance?: (nipds: string[], targetDate?: string) => void;
  onOpenScanner: () => void;
  onOpenTokenManager: () => void;
  onSelectStudentCard: (student: Student) => void;
  onNavigateToCrud?: () => void;
  schoolConfig?: SchoolConfig;
}

export const ClassAttendanceTab: React.FC<ClassAttendanceTabProps> = ({
  currentUser,
  students,
  rombels,
  attendanceRecords,
  selectedDate: propSelectedDate,
  onDateChange: propOnDateChange,
  onUpdateAttendance,
  onResetAttendance,
  onSaveRecord,
  onEditAttendanceRecord,
  onBulkUpdateAttendance,
  onBulkResetAttendance,
  onOpenScanner,
  onOpenTokenManager,
  onSelectStudentCard,
  onNavigateToCrud,
  schoolConfig,
}) => {
  // Date state (internal or controlled via props)
  const todayStr = getTodayDateStr();
  const [internalDate, setInternalDate] = useState<string>(todayStr);
  const selectedDate = propSelectedDate || internalDate;

  // Holiday & Non-effective day detection
  const holidayInfo = getHolidayInfo(selectedDate, schoolConfig);

  // State for Editing Date & Time directly from Class Attendance view
  const [editingDateTimeStudent, setEditingDateTimeStudent] = useState<{
    student: Student;
    record?: AttendanceRecord;
  } | null>(null);
  const [modalDate, setModalDate] = useState<string>(todayStr);
  const [modalTime, setModalTime] = useState<string>(getCurrentTimeStr());
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('hadir');
  const [modalNote, setModalNote] = useState<string>('');

  const getYesterdayDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  const getTwoDaysAgoDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().slice(0, 10);
  };

  const timePresets = [
    { label: '06:45', desc: 'Pagi' },
    { label: '07:00', desc: 'Tepat' },
    { label: '07:15', desc: 'Tepat' },
    { label: '07:30', desc: 'Batas' },
    { label: '07:45', desc: 'Telat' },
    { label: '08:00', desc: 'Telat' },
    { label: '12:00', desc: 'Siang' },
  ];

  const handleOpenDateTimeEdit = (std: Student, rec?: AttendanceRecord) => {
    setEditingDateTimeStudent({ student: std, record: rec });
    setModalDate(rec?.tanggal || selectedDate || todayStr);
    setModalTime(rec?.waktu && rec.waktu !== '-' ? rec.waktu : getCurrentTimeStr());
    setModalStatus(rec?.status || 'hadir');
    setModalNote(rec?.keterangan || '');
  };

  const handleSaveDateTimeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDateTimeStudent) return;
    const { student, record } = editingDateTimeStudent;

    if (onSaveRecord) {
      const updated: AttendanceRecord = {
        id: record?.id || `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nipd: student.nipd,
        rombelId: student.rombelId,
        tanggal: modalDate,
        waktu: modalTime,
        status: modalStatus,
        metode: record?.metode || (currentUser.role === 'admin' ? 'manual_admin' : currentUser.role === 'guru' ? 'manual_guru' : 'manual_pengurus'),
        recordedByName: `${currentUser.nama} (Koreksi Jam/Tgl)`,
        recordedByRole: currentUser.role,
        keterangan: modalNote.trim() || undefined,
      };
      onSaveRecord(updated);
    } else {
      onUpdateAttendance(student.nipd, modalStatus, modalNote.trim() || undefined, modalDate, modalTime);
    }

    setEditingDateTimeStudent(null);
  };

  const handleDateChange = (newDate: string) => {
    if (propOnDateChange) {
      propOnDateChange(newDate);
    } else {
      setInternalDate(newDate);
    }
  };

  // =========================================================================
  // LOGIKA DASHBOARD ROLE-BASED: WALAS, KETUA KELAS, & SEKRETARIS
  // =========================================================================
  const isWalas = currentUser.role === 'walas';
  const isKetuaKelas = currentUser.role === 'ketua_kelas';
  const isSekretaris = currentUser.role === 'sekretaris';
  const isRombelLeader = isWalas || isKetuaKelas || isSekretaris;

  // Temukan rombel yang dipimpin/ditugaskan berdasarkan ID rombel akun atau pencocokan penugasan
  const assignedRombel =
    rombels.find((r) => {
      if (currentUser.rombelId && r.id === currentUser.rombelId) return true;
      if (isWalas && currentUser.nipd && r.waliKelasNip === currentUser.nipd) return true;
      if (isWalas && currentUser.nama && r.waliKelasNama === currentUser.nama) return true;
      if (isKetuaKelas && currentUser.nipd && r.ketuaKelasNipd === currentUser.nipd) return true;
      if (isSekretaris && currentUser.nipd && r.sekretarisNipd === currentUser.nipd) return true;
      return false;
    }) ||
    (currentUser.rombelId ? rombels.find((r) => r.id === currentUser.rombelId) : undefined) ||
    rombels.find((r) => r.id === 'ROMBEL-XI-FAR') ||
    rombels[0];

  const assignedRombelId = assignedRombel?.id || 'ROMBEL-XI-FAR';

  // State Rombel aktif:
  // Jika role adalah 'walas', 'ketua_kelas', atau 'sekretaris', KUNCI AKSES hanya ke rombel yang dipimpin!
  const [activeRombelId, setActiveRombelId] = useState<string>(
    isRombelLeader ? assignedRombelId : 'ALL'
  );

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Batasan Akses Data Siswa:
  // Untuk walas, ketua_kelas, dan sekretaris, STRICTLY LOCK ke data rombel yang dipimpin!
  const effectiveRombelId = isRombelLeader ? assignedRombelId : activeRombelId;

  const currentStudents = students.filter((s) => {
    if (isRombelLeader) {
      return s.rombelId === assignedRombelId;
    }
    if (effectiveRombelId === 'ALL') return true;
    return s.rombelId === effectiveRombelId;
  });

  // Filter rekaman absensi pada tanggal yang dipilih
  const dateRecords = attendanceRecords.filter((r) => r.tanggal === selectedDate);
  const recordMap = new Map<string, AttendanceRecord>();
  dateRecords.forEach((r) => recordMap.set(r.nipd, r));

  // Hak mengedit:
  // Admin & Guru: Berwenang di semua rombel
  // Walas, Ketua, Sekretaris: Berwenang HANYA pada rombel yang mereka pimpin!
  const canEdit =
    currentUser.role === 'admin' ||
    currentUser.role === 'guru' ||
    currentUser.role === 'staf' ||
    (isRombelLeader && effectiveRombelId === assignedRombelId);

  // Ubah status manual satu siswa
  const handleStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    // Validasi pembatasan akses: pastikan siswa termasuk dalam rombel yang dipimpin
    if (isRombelLeader && student.rombelId !== assignedRombelId) {
      alert(`Akses Ditolak: Anda hanya berwenang mengabsenkan siswa di kelas ${assignedRombel.nama}!`);
      return;
    }
    if (!canEdit) return;

    onUpdateAttendance(student.nipd, newStatus, undefined, selectedDate);
  };

  // Reset status siswa ke 'Belum Absen' (Hapus kesalahan presensi)
  const handleResetStatus = (student: Student) => {
    if (!canEdit) return;
    if (isRombelLeader && student.rombelId !== assignedRombelId) return;

    if (
      window.confirm(
        `Reset data presensi ${student.nama} pada tanggal ${selectedDate}?\n\nStatus siswa akan kembali menjadi "Belum Absen" untuk meminimalisir kesalahan absen.`
      )
    ) {
      if (onResetAttendance) {
        onResetAttendance(student.nipd, selectedDate);
      }
    }
  };

  // Ubah catatan / keterangan
  const handleKeteranganChange = (student: Student, note: string) => {
    if (isRombelLeader && student.rombelId !== assignedRombelId) return;
    if (!canEdit) return;

    const existingRec = recordMap.get(student.nipd);
    const currentStatus = existingRec ? existingRec.status : 'hadir';
    onUpdateAttendance(student.nipd, currentStatus, note, selectedDate);
  };

  // Set Semua Siswa di Rombel Hadir (Fitur Massal Manual oleh Walas/Ketua/Sekretaris/Admin)
  const handleMarkAllHadir = () => {
    if (!canEdit) return;
    const targetNipds = currentStudents.map((s) => s.nipd);

    if (onBulkUpdateAttendance) {
      onBulkUpdateAttendance(targetNipds, 'hadir', selectedDate);
    } else {
      targetNipds.forEach((nipd) => {
        onUpdateAttendance(nipd, 'hadir', undefined, selectedDate);
      });
    }
  };

  // Reset Seluruh Siswa di Rombel ke Posisi "Belum Diabsen" (Hapus kesalahan presensi massal)
  const handleResetAllBelumAbsen = () => {
    if (!canEdit) return;
    if (
      window.confirm(
        `Kembalikan semua siswa (${currentStudents.length} siswa) ke status "Belum Diabsen" pada tanggal ${selectedDate}?\n\nPosisinya akan kembali seperti semula belum diabsen.`
      )
    ) {
      const targetNipds = currentStudents.map((s) => s.nipd);
      if (onBulkResetAttendance) {
        onBulkResetAttendance(targetNipds, selectedDate);
      } else if (onResetAttendance) {
        targetNipds.forEach((nipd) => {
          onResetAttendance(nipd, selectedDate);
        });
      }
    }
  };

  // Perhitungan statistik rombel aktif
  let hadirCount = 0;
  let sakitCount = 0;
  let izinCount = 0;
  let alfaCount = 0;
  let belumAbsenCount = 0;

  currentStudents.forEach((s) => {
    const rec = recordMap.get(s.nipd);
    if (!rec) {
      belumAbsenCount++;
    } else if (rec.status === 'hadir') hadirCount++;
    else if (rec.status === 'sakit') sakitCount++;
    else if (rec.status === 'izin') izinCount++;
    else if (rec.status === 'alfa') alfaCount++;
  });

  const totalSiswaVisible = currentStudents.length;
  const attendanceRateToday = totalSiswaVisible > 0 ? Math.round((hadirCount / totalSiswaVisible) * 100) : 0;

  // Filter pencarian & status
  const displayedStudents = currentStudents.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nipd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (statusFilter === 'ALL') return true;
    const rec = recordMap.get(s.nipd);
    const st = rec ? rec.status : 'belum';
    return st === statusFilter;
  });

  const getRombelName = (id: string) => rombels.find((r) => r.id === id)?.nama || id;

  return (
    <div className="space-y-5">
      {/* =========================================================================
          1. DASHBOARD_ROLE_BASED PANEL
          Menampilkan UI khusus dengan tombol aksi absensi manual dan generator token
          khusus kepada pengguna dengan role walas, ketua_kelas, atau sekretaris
          dengan batasan akses hanya pada data rombel yang mereka pimpin.
         ========================================================================= */}
      {isRombelLeader && (
        <section
          id="dashboard_role_based"
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Role Header & Led Class Scope Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isWalas && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    PORTAL WALI KELAS
                  </span>
                )}
                {isKetuaKelas && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    PORTAL KETUA KELAS
                  </span>
                )}
                {isSekretaris && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 shadow-xs">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    PORTAL SEKRETARIS KELAS
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/10 text-slate-200 border border-white/20">
                  Rombel Pimpinan: <strong className="text-white font-black">{assignedRombel.nama}</strong>
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Akses Terkunci Khusus Kelas Anda
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Selamat Bertugas, {currentUser.nama}!</span>
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
                  Anda memiliki hak istimewa untuk <strong>mengabsenkan siswa</strong>, melakukan{' '}
                  <strong>absensi manual langsung</strong> (Hadir, Sakit, Izin, Alfa), dan{' '}
                  <strong>membuat token presensi mandiri</strong> khusus bagi {totalSiswaVisible} siswa di rombel{' '}
                  <span className="text-emerald-300 font-bold">{assignedRombel.nama}</span>.
                </p>
              </div>
            </div>

            {/* Role-Specific Action Controls in dashboard_role_based */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              {/* 1. Tombol Aksi Absensi Manual Massal: Set Semua Hadir */}
              <button
                id="btn-role-mark-all-present"
                onClick={handleMarkAllHadir}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 border border-emerald-400/30 cursor-pointer"
                title={`Tandai seluruh siswa kelas ${assignedRombel.nama} hadir hari ini`}
              >
                <UserCheck className="w-4 h-4 text-emerald-200" />
                <span>Set Semua Hadir</span>
              </button>

              {/* Tombol Reset Belum Diabsen */}
              <button
                id="btn-role-reset-all-unattended"
                onClick={handleResetAllBelumAbsen}
                className="px-3 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-600 cursor-pointer"
                title="Kembalikan semua siswa ke status 'Belum Diabsen'"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Belum Absen</span>
              </button>

              {/* 2. Tombol Generator Token Khusus Rombel */}
              <button
                id="btn-role-generate-token"
                onClick={onOpenTokenManager}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 border border-indigo-400/30 cursor-pointer"
                title={`Buat token 6-digit untuk presensi mandiri siswa ${assignedRombel.nama}`}
              >
                <Key className="w-4 h-4 text-indigo-200" />
                <span>Buat Token Kelas</span>
              </button>

              {/* 3. Tombol Scanner Kamera QR Kelas */}
              <button
                id="btn-role-scanner-qr"
                onClick={onOpenScanner}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 border border-slate-600 cursor-pointer"
                title="Buka scanner kamera QR untuk scan kartu NIPD siswa"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Scanner QR</span>
              </button>
            </div>
          </div>

          {/* Quick Real-time Rombel Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 font-medium block">Total Siswa</span>
              <span className="text-base font-black text-white">{totalSiswaVisible} Siswa</span>
            </div>
            <div className="bg-emerald-500/20 px-3 py-2 rounded-xl border border-emerald-400/30">
              <span className="text-[10px] text-emerald-300 font-medium block">Hadir</span>
              <span className="text-base font-black text-emerald-200">{hadirCount} Siswa</span>
            </div>
            <div className="bg-amber-500/20 px-3 py-2 rounded-xl border border-amber-400/30">
              <span className="text-[10px] text-amber-300 font-medium block">Sakit (S)</span>
              <span className="text-base font-black text-amber-200">{sakitCount} Siswa</span>
            </div>
            <div className="bg-sky-500/20 px-3 py-2 rounded-xl border border-sky-400/30">
              <span className="text-[10px] text-sky-300 font-medium block">Izin (I)</span>
              <span className="text-base font-black text-sky-200">{izinCount} Siswa</span>
            </div>
            <div className="bg-rose-500/20 px-3 py-2 rounded-xl border border-rose-400/30">
              <span className="text-[10px] text-rose-300 font-medium block">Alfa (A)</span>
              <span className="text-base font-black text-rose-200">{alfaCount} Siswa</span>
            </div>
            <div className="bg-slate-700/60 px-3 py-2 rounded-xl border border-slate-500/30 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-300 font-medium block">Belum Diabsen</span>
              <span className="text-base font-black text-amber-300">{belumAbsenCount} Siswa</span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. GENERAL CONTROL BAR & DATE PICKER
         ========================================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Date Selector with Holiday Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Tanggal:</span>
            <input
              id="input-attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Formatted Date & Holiday Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              {formatIndonesianDateWithDay(selectedDate)}
            </span>

            {holidayInfo.isHoliday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Libur: {holidayInfo.holidayName}
              </span>
            )}
          </div>

          {isRombelLeader ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Ruang Lingkup Presensi:{' '}
                <strong className="font-bold text-emerald-800">{assignedRombel.nama}</strong>
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Hak Akses: {currentUser.role.toUpperCase()} (Semua Rombel)</span>
            </div>
          )}
        </div>

        {/* Right: General Controls (Shown if not already in role banner, or for admin/guru) */}
        {!isRombelLeader && (
          <div className="flex flex-wrap items-center gap-2">
            {currentUser.role === 'admin' && onNavigateToCrud && (
              <button
                id="btn-shortcut-to-attendance-crud"
                onClick={onNavigateToCrud}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Buka panel lengkap Kelola & Koreksi Absen (CRUD Presensi)"
              >
                <ClipboardEdit className="w-4 h-4 text-indigo-600" />
                <span>Koreksi & CRUD Absen</span>
              </button>
            )}

            <button
              id="btn-open-camera-scanner"
              onClick={onOpenScanner}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              Scanner Kamera QR
            </button>

            <button
              id="btn-open-token-modal"
              onClick={onOpenTokenManager}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              Token Absen
            </button>

            {canEdit && (
              <>
                <button
                  id="btn-mark-all-present"
                  onClick={handleMarkAllHadir}
                  title="Tandai semua siswa di kelas ini hadir"
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Set Semua Hadir</span>
                </button>

                <button
                  id="btn-reset-all-unattended"
                  onClick={handleResetAllBelumAbsen}
                  title="Kembalikan semua siswa ke status Belum Diabsen"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Belum Absen</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tanggal Merah / Hari Libur Alert Banner */}
      {holidayInfo.isHoliday && (
        <div
          id="banner-holiday-alert"
          className="bg-gradient-to-r from-rose-50 via-rose-100 to-amber-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5 text-rose-950"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white tracking-wide uppercase">
                TANGGAL MERAH / HARI LIBUR
              </span>
              <span className="text-sm sm:text-base font-black text-rose-900">
                {holidayInfo.holidayName}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-200 text-rose-800 border border-rose-300 font-mono">
                {formatIndonesianDateWithDay(selectedDate)}
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              {holidayInfo.description ||
                'Tanggal yang dipilih merupakan hari libur resmi atau akhir pekan non-efektif. Pembelajaran ditiadakan secara normal. Presensi tetap dapat dicatat jika ada kegiatan khusus/ekstrakurikuler.'}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. CLASS / ROMBEL NAVIGATION TABS
          Batasan Akses: Untuk walas, ketua_kelas, dan sekretaris, HANYA tampilkan
          rombel yang mereka pimpin! Pilihan 'Semua Kelas' dan kelas lain disembunyikan.
         ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {/* Tombol 'Semua Kelas' hanya tersedia untuk Admin dan Guru */}
        {!isRombelLeader && (
          <button
            id="tab-rombel-all"
            onClick={() => setActiveRombelId('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
              activeRombelId === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Semua Kelas</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-200">
              {students.length}
            </span>
          </button>
        )}

        {rombels.map((rombel) => {
          // JIKA PENGGUNA ADALAH WALAS, KETUA KELAS, ATAU SEKRETARIS:
          // Sembunyikan kelas lain, batasi akses strictly ke rombel pimpinan mereka!
          if (isRombelLeader && rombel.id !== assignedRombelId) {
            return null;
          }

          const countInClass = students.filter((s) => s.rombelId === rombel.id).length;
          const isActive = effectiveRombelId === rombel.id;

          return (
            <button
              key={rombel.id}
              id={`tab-rombel-${rombel.id}`}
              onClick={() => {
                if (!isRombelLeader) {
                  setActiveRombelId(rombel.id);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{rombel.nama}</span>
              {isRombelLeader && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-100 font-bold">
                  Kelas Anda
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {countInClass} Siswa
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          4. STATISTIK RINGKASAN KEHADIRAN
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Siswa
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalSiswaVisible}</p>
          <span className="text-[10px] text-slate-400">
            {effectiveRombelId === 'ALL' ? 'Semua Rombel' : getRombelName(effectiveRombelId)}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Hadir (H)
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{hadirCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {totalSiswaVisible > 0 ? Math.round((hadirCount / totalSiswaVisible) * 100) : 0}% hadir
          </span>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Sakit (S)
          </span>
          <p className="text-xl font-bold text-amber-700 mt-1">{sakitCount}</p>
          <span className="text-[10px] text-amber-600">Surat Dokter / Izin</span>
        </div>

        <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 shadow-xs">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
            Izin (I)
          </span>
          <p className="text-xl font-bold text-sky-700 mt-1">{izinCount}</p>
          <span className="text-[10px] text-sky-600">Dispensasi</span>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Alfa (A)
          </span>
          <p className="text-xl font-bold text-rose-700 mt-1">{alfaCount}</p>
          <span className="text-[10px] text-rose-600">Tanpa Keterangan</span>
        </div>

        <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-300 shadow-xs">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Belum Diabsen
          </span>
          <p className="text-xl font-bold text-slate-800 mt-1">{belumAbsenCount}</p>
          <span className="text-[10px] text-slate-500">Posisinya Belum Absen</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-2xl text-white shadow-xs">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            Persentase Hari Ini
          </span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{attendanceRateToday}%</p>
          <span className="text-[10px] text-slate-400">
            {hadirCount}/{totalSiswaVisible} Hadir
          </span>
        </div>
      </div>

      {/* =========================================================================
          5. FILTER STATUS & SEARCH
         ========================================================================= */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-student-attendance"
            type="text"
            placeholder="Cari nama, NIPD, atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Status ({currentStudents.length})</option>
            <option value="hadir">Hadir ({hadirCount})</option>
            <option value="sakit">Sakit ({sakitCount})</option>
            <option value="izin">Izin ({izinCount})</option>
            <option value="alfa">Alfa ({alfaCount})</option>
            <option value="belum">Belum Absen ({belumAbsenCount})</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          6. TABEL DATA PRESENSI SISWA & AKSI ABSENSI MANUAL
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">NIPD & NISN</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Kelas (Rombel)</th>
                <th className="py-3.5 px-4 text-center">Status Presensi</th>
                <th className="py-3.5 px-4">Jam Masuk</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4 text-center">Aksi Absensi Manual</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-center w-24">Kartu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    Tidak ada data siswa ditemukan untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((std, idx) => {
                  const record = recordMap.get(std.nipd);
                  const status = record?.status || 'belum';
                  const waktu = record?.waktu || '-';
                  const metode = record?.metode;

                  // Siswa dapat diedit jika user adalah admin/guru, atau pengurus rombel ini
                  const isRowEditable = canEdit && (!isRombelLeader || std.rombelId === assignedRombelId);

                  return (
                    <tr key={std.nipd} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-emerald-700">{std.nipd}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NISN: {std.nisn}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{std.nama}</div>
                        <div className="text-[11px] text-slate-500">
                          {std.jk === 'P' ? 'Perempuan' : 'Laki-Laki'} • {std.tempatLahir}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{getRombelName(std.rombelId)}</span>
                      </td>
                      {/* Kolom Status Presensi Real-Time */}
                      <td className="py-3 px-4 text-center">
                        {status === 'belum' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Belum Diabsen
                          </span>
                        )}
                        {status === 'hadir' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Hadir
                          </span>
                        )}
                        {status === 'sakit' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Sakit (S)
                          </span>
                        )}
                        {status === 'izin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                            Izin (I)
                          </span>
                        )}
                        {status === 'alfa' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            Alfa (A)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {waktu !== '-' ? (
                          <button
                            type="button"
                            disabled={!isRowEditable}
                            onClick={() => handleOpenDateTimeEdit(std, record)}
                            className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition border border-transparent hover:border-indigo-200 cursor-pointer"
                            title="Klik untuk koreksi tanggal & jam masuk presensi"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            {waktu}
                            <Edit className="w-2.5 h-2.5 opacity-40 hover:opacity-100 ml-0.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!isRowEditable}
                            onClick={() => handleOpenDateTimeEdit(std, record)}
                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg text-xs transition inline-flex items-center gap-1 cursor-pointer"
                            title="Klik untuk input presensi dengan tanggal/jam kustom"
                          >
                            <span>-</span>
                            <Edit className="w-2.5 h-2.5 opacity-40" />
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {metode === 'qr_scan' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <QrCode className="w-3 h-3" /> QR Scan
                          </span>
                        )}
                        {metode === 'token' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            <Key className="w-3 h-3" /> Token
                          </span>
                        )}
                        {metode === 'manual_admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            Manual Admin
                          </span>
                        )}
                        {metode === 'manual_guru' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Manual Guru
                          </span>
                        )}
                        {metode === 'manual_pengurus' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pengurus Kelas
                          </span>
                        )}
                        {!metode && <span className="text-[10px] text-slate-400 italic">Belum absen</span>}
                      </td>

                      {/* Tombol Aksi Absensi Manual Interaktif (H, S, I, A) & Reset Koreksi */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                            <button
                              id={`btn-status-hadir-${std.nipd}`}
                              title="Tandai Hadir"
                              disabled={!isRowEditable}
                              onClick={() => handleStatusChange(std, 'hadir')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                status === 'hadir'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              H
                            </button>
                            <button
                              id={`btn-status-sakit-${std.nipd}`}
                              title="Tandai Sakit"
                              disabled={!isRowEditable}
                              onClick={() => handleStatusChange(std, 'sakit')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                status === 'sakit'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              S
                            </button>
                            <button
                              id={`btn-status-izin-${std.nipd}`}
                              title="Tandai Izin"
                              disabled={!isRowEditable}
                              onClick={() => handleStatusChange(std, 'izin')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                status === 'izin'
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                              }`}
                            >
                              I
                            </button>
                            <button
                              id={`btn-status-alfa-${std.nipd}`}
                              title="Tandai Alfa"
                              disabled={!isRowEditable}
                              onClick={() => handleStatusChange(std, 'alfa')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                status === 'alfa'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              A
                            </button>
                          </div>

                          {/* Tombol Edit Tanggal & Jam */}
                          {isRowEditable && (
                            <button
                              id={`btn-edit-time-${std.nipd}`}
                              onClick={() => handleOpenDateTimeEdit(std, record)}
                              title="Koreksi Tanggal & Jam Absensi Siswa"
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Tombol Reset / Hapus Rekaman Presensi yang Salah */}
                          {record && isRowEditable && (
                            <button
                              id={`btn-reset-attendance-${std.nipd}`}
                              onClick={() => handleResetStatus(std)}
                              title="Reset / Hapus Absensi: Kembalikan status siswa menjadi Belum Absen (meminimalisir salah catat)"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Tombol Koreksi Detail Modal untuk Admin */}
                          {record && onEditAttendanceRecord && currentUser.role === 'admin' && (
                            <button
                              id={`btn-edit-detail-${std.nipd}`}
                              onClick={() => onEditAttendanceRecord(record)}
                              title="Koreksi detail jam/tanggal/alasan absensi"
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Input Keterangan / Catatan Manual */}
                      <td className="py-3 px-4">
                        <input
                          id={`input-note-${std.nipd}`}
                          type="text"
                          placeholder="Catatan..."
                          disabled={!isRowEditable}
                          value={record?.keterangan || ''}
                          onChange={(e) => handleKeteranganChange(std, e.target.value)}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-1.5 py-1 text-xs text-slate-700 rounded transition focus:outline-none"
                        />
                      </td>

                      {/* Cetak Kartu Pelajar Digital */}
                      <td className="py-3 px-4 text-center">
                        <button
                          title="Lihat Kartu Pelajar & QR Code"
                          onClick={() => onSelectStudentCard(std)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Tanggal & Jam Presensi Siswa */}
      {editingDateTimeStudent && (
        <div
          id="modal-edit-datetime-student"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Koreksi Tanggal & Jam Presensi</h3>
                  <p className="text-[11px] text-slate-400">Atur tanggal absensi dan jam masuk siswa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDateTimeStudent(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{editingDateTimeStudent.student.nama}</div>
                <div className="text-[11px] font-mono text-emerald-700 font-bold">
                  NIPD: {editingDateTimeStudent.student.nipd}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                {getRombelName(editingDateTimeStudent.student.rombelId)}
              </span>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveDateTimeEdit} className="p-5 space-y-4 text-xs">
              {/* Tanggal & Jam Box */}
              <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Tanggal Presensi:</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setModalDate(todayStr)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                        modalDate === todayStr
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDate(getYesterdayDateStr())}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                        modalDate === getYesterdayDateStr()
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Kemarin
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDate(getTwoDaysAgoDateStr())}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                        modalDate === getTwoDaysAgoDateStr()
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      2 Hari Lalu
                    </button>
                  </div>
                </div>

                {/* Jam Masuk */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">Jam Masuk (Waktu Presensi):</label>
                    <button
                      type="button"
                      onClick={() => setModalTime(getCurrentTimeStr())}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Clock className="w-3 h-3" />
                      Jam Sekarang
                    </button>
                  </div>
                  <input
                    type="text"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    required
                    placeholder="HH:mm:ss (contoh: 07:15:00)"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
                  />
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    {timePresets.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setModalTime(`${t.label}:00`)}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                          modalTime.startsWith(t.label)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={`${t.label} (${t.desc})`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Kehadiran */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Status Kehadiran:</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalStatus('hadir')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      modalStatus === 'hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    Hadir (H)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus('sakit')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      modalStatus === 'sakit'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    Sakit (S)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus('izin')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      modalStatus === 'izin'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    Izin (I)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus('alfa')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      modalStatus === 'alfa'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    Alfa (A)
                  </button>
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Keterangan / Alasan (Opsional):</label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Contoh: Datang terlambat 15 menit, izin ke dokter, dll."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDateTimeStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
