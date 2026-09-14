import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, Student, Rombel, AttendanceRecord, AttendanceToken, SchoolConfig } from '../types';
import { generateQrDataUrl } from '../utils/qrcode';
import { getCurrentTimeStr, getTodayDateStr, calculateAttendanceRate } from '../utils/storage';
import { getHolidayInfo, formatIndonesianDateWithDay } from '../utils/holidays';
import { getUserGreetingDetails } from '../utils/greetings';
import { BirthdayCelebrationModal } from './BirthdayCelebrationModal';
import { compressImageFile } from '../utils/imageCompressor';
import {
  QrCode,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Lock,
  User,
  Download,
  Save,
  Calendar,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  PartyPopper,
  Cake,
} from 'lucide-react';

interface StudentPortalTabProps {
  currentUser: UserAccount;
  student: Student | null;
  rombel?: Rombel;
  attendanceRecords: AttendanceRecord[];
  activeTokens: AttendanceToken[];
  onTokenCheckIn: (token: string) => { success: boolean; message: string };
  onUpdateCurrentUser: (updatedUser: UserAccount) => void;
  onSelectStudentCard: (student: Student) => void;
  schoolConfig: SchoolConfig;
}

export const StudentPortalTab: React.FC<StudentPortalTabProps> = ({
  currentUser,
  student,
  rombel,
  attendanceRecords,
  activeTokens,
  onTokenCheckIn,
  onUpdateCurrentUser,
  onSelectStudentCard,
  schoolConfig,
}) => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [tokenNotice, setTokenNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Account Settings Form
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(currentUser.foto || student?.foto || '');
  const [phone, setPhone] = useState<string>(currentUser.telepon || '');
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const [showBirthdayCard, setShowBirthdayCard] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentNipd = currentUser.nipd || student?.nipd || '';
  const currentPhoto = photoUrl || currentUser.foto || student?.foto || '';

  // Get personalized greeting and birthday status
  const greetingDetails = getUserGreetingDetails(currentUser, student);

  useEffect(() => {
    if (currentUser.foto || student?.foto) {
      setPhotoUrl(currentUser.foto || student?.foto || '');
    }
  }, [currentUser.foto, student?.foto]);

  useEffect(() => {
    if (studentNipd) {
      generateQrDataUrl(studentNipd).then((url) => setQrDataUrl(url));
    }
  }, [studentNipd]);

  // Calculate student personal attendance statistics
  const myRecords = attendanceRecords.filter((r) => r.nipd === studentNipd);
  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alfa = 0;

  myRecords.forEach((r) => {
    if (r.status === 'hadir') hadir++;
    else if (r.status === 'sakit') sakit++;
    else if (r.status === 'izin') izin++;
    else if (r.status === 'alfa') alfa++;
  });

  const totalHariEfektif = schoolConfig.totalHariEfektifSemester;
  const attendanceRate = calculateAttendanceRate(hadir, totalHariEfektif);

  // Check today's status
  const todayStr = getTodayDateStr();
  const todayRecord = myRecords.find((r) => r.tanggal === todayStr);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    const result = onTokenCheckIn(tokenInput.trim().toUpperCase());
    if (result.success) {
      setTokenNotice({ type: 'success', text: result.message });
      setTokenInput('');
    } else {
      setTokenNotice({ type: 'error', text: result.message });
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('Konfirmasi sandi baru tidak cocok!');
      return;
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      foto: photoUrl.trim() || undefined,
      telepon: phone.trim() || undefined,
    };

    if (newPassword.trim()) {
      updatedUser.password = newPassword.trim();
    }

    onUpdateCurrentUser(updatedUser);
    setSettingsNotice('Profil dan foto berhasil diperbarui!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSettingsNotice(null), 4000);
  };

  const handlePhotoFileUpload = async (file: File) => {
    try {
      setIsProcessingPhoto(true);
      const compressed = await compressImageFile(file, 320, 420, 0.85);
      setPhotoUrl(compressed);
      setIsProcessingPhoto(false);
    } catch (err: any) {
      alert(err?.message || 'Gagal memproses gambar');
      setIsProcessingPhoto(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_NIPD_${studentNipd}_${currentUser.nama}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Special Birthday Celebration Ribbon (if today is their birthday) */}
      {greetingDetails.isBirthday && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-amber-300 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-sm pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0 border border-white/30">
              🎂
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 border border-white/40">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Hari Istimewa Siswa!
                </span>
                {greetingDetails.age && (
                  <span className="text-xs font-bold text-yellow-200">
                    Genap {greetingDetails.age} Tahun
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black mt-1 tracking-tight">
                Selamat Ulang Tahun, {currentUser.nama}! 🎉
              </h3>
              <p className="text-xs text-amber-100 max-w-2xl mt-1 leading-relaxed">
                {greetingDetails.birthdayWish}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBirthdayCard(true)}
            className="relative z-10 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-100 font-bold text-xs shadow-md hover:shadow-lg transition shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PartyPopper className="w-4 h-4 text-rose-600" />
            <span>Buka Kartu Ucapan Ulang Tahun 🥳</span>
          </button>
        </div>
      )}

      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={currentUser.nama}
                  className="w-16 h-20 sm:w-20 sm:h-26 rounded-2xl object-cover border-2 border-emerald-300 shadow-md bg-white"
                />
              ) : (
                <div className="w-16 h-20 sm:w-20 sm:h-26 rounded-2xl bg-emerald-500/30 border-2 border-emerald-300/60 flex flex-col items-center justify-center font-bold text-2xl text-emerald-200">
                  <User className="w-7 h-7 mb-1 opacity-70" />
                  <span className="text-sm font-bold">{currentUser.nama.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              {greetingDetails.isBirthday && (
                <span
                  title="Ulang Tahun Hari Ini! 🎂"
                  onClick={() => setShowBirthdayCard(true)}
                  className="absolute -top-2 -right-2 p-1.5 bg-amber-400 text-slate-900 rounded-full shadow-md border-2 border-white cursor-pointer hover:scale-110 transition animate-bounce"
                >
                  <Cake className="w-3.5 h-3.5 text-rose-600" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                  <span>{greetingDetails.icon}</span>
                  <span>{greetingDetails.timeGreeting}</span>
                </span>
                {greetingDetails.isBirthday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/30 text-amber-200 border border-amber-400/40">
                    🎂 Milad Hari Ini!
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">{currentUser.nama}</h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">{greetingDetails.subtext}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200 mt-2 font-mono">
                <span>NIPD: <strong className="text-white">{studentNipd}</strong></span>
                <span>•</span>
                <span>Kelas: <strong className="text-white">{rombel?.nama || currentUser.rombelId || 'Siswa'}</strong></span>
                {student?.tanggalLahir && (
                  <>
                    <span>•</span>
                    <span>Tgl Lahir: <strong className="text-white">{greetingDetails.birthDateFormatted || student.tanggalLahir}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Today Attendance Status Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
            <span className="text-[11px] font-medium text-emerald-200 block">Status Presensi Hari Ini:</span>
            {todayRecord ? (
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <div>
                  <span className="text-sm font-bold uppercase tracking-wide text-white">
                    {todayRecord.status}
                  </span>
                  <span className="text-[11px] text-emerald-200 block font-mono">
                    Pukul {todayRecord.waktu} ({todayRecord.metode})
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-amber-200">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-bold">Belum Presensi Hari Ini</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tanggal Merah / Hari Libur Notification in Student Portal */}
      {(() => {
        const holidayInfo = getHolidayInfo(todayStr, schoolConfig);
        if (!holidayInfo.isHoliday) return null;
        return (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-rose-950 shadow-xs">
            <Calendar className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold text-rose-900 flex items-center gap-2">
                <span>Hari Ini Tanggal Merah / Libur: {holidayInfo.holidayName}</span>
                <span className="font-mono text-[11px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded">
                  {formatIndonesianDateWithDay(todayStr)}
                </span>
              </p>
              <p className="text-rose-800 text-[11px]">
                {holidayInfo.description ||
                  'Hari ini merupakan hari libur resmi atau akhir pekan. Presensi mandiri ditiadakan kecuali ada kegiatan khusus atau ekstrakurikuler sekolah.'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Role Notice & Access Explainer */}
      {currentUser.role === 'ketua_kelas' || currentUser.role === 'sekretaris' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950 shadow-xs">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold text-emerald-900">
              Akun Terpadu Pengurus Kelas: {currentUser.nama} (Sebagai Siswa & {currentUser.role === 'ketua_kelas' ? 'Ketua Kelas' : 'Sekretaris'})
            </p>
            <p className="text-emerald-800 text-[11px]">
              Anda hanya memiliki <strong>1 akun tunggal</strong> untuk login siswa sekaligus pengurus kelas ({currentUser.username}).
              Anda memiliki hak istimewa untuk mengabsen teman sekelas Anda di tab <strong>Presensi Per Kelas</strong> serta membuat token presensi rombel.
              Di tab ini, Anda dapat memantau kartu pelajar digital dan statistik kehadiran pribadi Anda sendiri.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-bold">
              Anda sedang masuk dengan Akun Siswa: {currentUser.nama} (NIPD: {studentNipd || '-'})
            </p>
            <p className="text-amber-800 text-[11px]">
              Sesuai kebijakan keamanan, akun siswa hanya dapat mengakses <strong>Portal Siswa</strong> (Presensi Mandiri via Token, Kartu Pelajar Digital & Riwayat Presensi Anda).
              Menu <em>Pengaturan Profil Sekolah, Data Siswa Lain, Kelola Rombel, dan Kelola Pengguna</em> hanya dapat diakses oleh <strong>Administrator</strong> atau <strong>Guru</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Grid: 2 Columns (Left: QR & Token Check-in; Right: Stats & Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): QR Code Card & Token Input */}
        <div className="lg:col-span-5 space-y-6">
          {/* Digital QR Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">QR Code NIPD Saya</h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {studentNipd}
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Siswa ${studentNipd}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  Membuat QR...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Tunjukkan QR Code ini ke kamera scanner guru atau admin di gerbang sekolah saat masuk.
            </p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                id="btn-download-my-qr"
                onClick={handleDownloadQr}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Unduh QR
              </button>
              {student && (
                <button
                  id="btn-view-my-card"
                  onClick={() => onSelectStudentCard(student)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  Lihat Kartu Pelajar
                </button>
              )}
            </div>
          </div>

          {/* Token Check-in Form */}
          <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Absen Mandiri dengan Token</h3>
                <p className="text-[11px] text-slate-500">Masukkan kode token yang diberikan ketua kelas atau guru</p>
              </div>
            </div>

            {tokenNotice && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                  tokenNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {tokenNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{tokenNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Token Presensi (Contoh: TK-8492)
                </label>
                <input
                  id="input-student-token"
                  type="text"
                  placeholder="Ketik kode token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base font-mono font-bold uppercase tracking-wider text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                id="btn-submit-student-token"
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi Kehadiran Sekarang
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 Cols): Stats, History & Account Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Attendance Stats Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-800">Statistik Kehadiran Semester Ini</h3>
              <span className="text-xs text-slate-500">
                Target: {totalHariEfektif} Hari Efektif
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Hadir</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{hadir}</p>
                <span className="text-[10px] text-emerald-600 font-medium">Hari</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Sakit</span>
                <p className="text-2xl font-black text-amber-700 mt-1">{sakit}</p>
                <span className="text-[10px] text-amber-600 font-medium">Hari</span>
              </div>
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-sky-800 uppercase block">Izin</span>
                <p className="text-2xl font-black text-sky-700 mt-1">{izin}</p>
                <span className="text-[10px] text-sky-600 font-medium">Hari</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-center">
                <span className="text-[11px] font-bold text-rose-800 uppercase block">Alfa</span>
                <p className="text-2xl font-black text-rose-700 mt-1">{alfa}</p>
                <span className="text-[10px] text-rose-600 font-medium">Hari</span>
              </div>
            </div>

            {/* Percentage Bar & Formula */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Persentase Kehadiran Akhir:</span>
                <span className="font-black text-emerald-700 font-mono text-base">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Formula: ({hadir} Hadir / {totalHariEfektif} Hari Efektif) × 100% = {attendanceRate}%
              </p>
            </div>
          </div>

          {/* Account Settings / Kelola Akun Siswa */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-slate-700" />
              <div>
                <h3 className="font-bold text-sm text-slate-800">Pengaturan Akun & Keamanan Siswa</h3>
                <p className="text-[11px] text-slate-500">Atur kata sandi / PIN baru dan sesuaikan profil pribadi</p>
              </div>
            </div>

            {settingsNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {settingsNotice}
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ganti Kata Sandi / PIN Baru
                  </label>
                  <input
                    id="input-student-new-password"
                    type="password"
                    placeholder="Minimal 3 karakter..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Sandi Baru
                  </label>
                  <input
                    id="input-student-confirm-password"
                    type="password"
                    placeholder="Ulangi sandi..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Pasfoto 3x4 Profil Siswa */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Pasfoto Profil Siswa (Rasio 3x4)
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview Pasfoto 3x4 */}
                  <div className="relative w-24 h-32 rounded-xl bg-white border-2 border-emerald-500/40 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Pasfoto Siswa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <User className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 font-bold block leading-tight">
                          Belum Ada Foto
                        </span>
                      </div>
                    )}

                    {isProcessingPhoto && (
                      <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengompres...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Drag & Drop Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragLeave={() => setIsDraggingPhoto(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handlePhotoFileUpload(file);
                      }}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition ${
                        isDraggingPhoto
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-300 hover:border-emerald-400 bg-white'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoFileUpload(file);
                        }}
                      />
                      <p className="text-xs text-slate-600">
                        Seret foto ke sini atau{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-emerald-700 font-bold underline hover:text-emerald-800 cursor-pointer"
                        >
                          Pilih Berkas
                        </button>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Mendukung JPG, PNG, atau WebP (otomatis dioptimasi ke ukuran 3x4)
                      </p>
                    </div>

                    {/* Or URL input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atau Link:</span>
                      <input
                        id="input-student-photo-url"
                        type="url"
                        placeholder="https://...link-foto.jpg"
                        value={photoUrl.startsWith('data:') ? '' : photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp / Kontak Siswa
                </label>
                <input
                  id="input-student-phone"
                  type="tel"
                  placeholder="0812-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  id="btn-save-student-settings"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Foto & Perubahan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Birthday Celebration Modal */}
      {showBirthdayCard && (
        <BirthdayCelebrationModal
          user={currentUser}
          student={student}
          age={greetingDetails.age}
          birthdayWish={greetingDetails.birthdayWish}
          onClose={() => setShowBirthdayCard(false)}
        />
      )}
    </div>
  );
};
