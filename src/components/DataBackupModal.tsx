import React, { useState, useRef } from 'react';
import {
  SchoolConfig,
  Student,
  Rombel,
  UserAccount,
  AttendanceRecord,
  AttendanceToken,
  Teacher,
  Subject,
  ScheduleItem,
} from '../types';
import {
  exportFullDatabaseBackup,
  importFullDatabaseBackup,
  saveStudentList,
  saveRombelList,
  saveUserList,
  saveSchoolConfig,
  saveAttendanceRecords,
  saveTokens,
  saveTeacherList,
  saveSubjectList,
  saveScheduleList,
  FullBackupPayload,
} from '../utils/storage';
import { firestoreRestoreFullBackup } from '../utils/firestoreSync';
import {
  Database,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  RefreshCw,
  X,
  ShieldCheck,
  Cloud,
} from 'lucide-react';


interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolConfig: SchoolConfig;
  students: Student[];
  rombels: Rombel[];
  users: UserAccount[];
  attendanceRecords: AttendanceRecord[];
  tokens: AttendanceToken[];
  teachers?: Teacher[];
  subjects?: Subject[];
  schedules?: ScheduleItem[];
  onDataRestored: (payload: {
    schoolConfig: SchoolConfig;
    students: Student[];
    rombels: Rombel[];
    users: UserAccount[];
    attendanceRecords: AttendanceRecord[];
    tokens: AttendanceToken[];
    teachers?: Teacher[];
    subjects?: Subject[];
    schedules?: ScheduleItem[];
  }) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  schoolConfig,
  students,
  rombels,
  users,
  attendanceRecords,
  tokens,
  teachers = [],
  subjects = [],
  schedules = [],
  onDataRestored,
  onShowToast,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Backup
  const handleDownloadBackup = () => {
    try {
      const jsonStr = exportFullDatabaseBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const cleanSchoolName = (schoolConfig.namaSekolah || 'sekolah')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const dateStr = new Date().toISOString().slice(0, 10);

      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_absensi_${cleanSchoolName}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Berkas cadangan JSON berhasil diunduh ke komputer/perangkat Anda!');
      onShowToast('Cadangan data berhasil diekspor!', 'success');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(`Gagal mengekspor data: ${err?.message || err}`);
    }
  };

  // 2. Upload and Restore Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error('Berkas kosong');

        const res = importFullDatabaseBackup(content);
        if (res.success && res.data) {
          onDataRestored({
            schoolConfig: res.data.schoolConfig,
            students: res.data.students,
            rombels: res.data.rombels,
            users: res.data.users,
            attendanceRecords: res.data.attendanceRecords,
            tokens: res.data.tokens,
            teachers: res.data.teachers,
            subjects: res.data.subjects,
            schedules: res.data.schedules,
          });
          setSuccessMsg(res.message);
          onShowToast(res.message, 'success');
        } else {
          setErrorMsg(res.message);
          onShowToast(res.message, 'error');
        }
      } catch (err: any) {
        setErrorMsg(`Format berkas tidak valid: ${err?.message || 'Error parsing JSON'}`);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas dari sistem penyimpanan.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // 3. Force Re-save to browser storage and Cloud Firebase
  const handleForceResave = async () => {
    setIsProcessing(true);
    saveSchoolConfig(schoolConfig);
    saveStudentList(students);
    saveRombelList(rombels);
    saveUserList(users);
    saveAttendanceRecords(attendanceRecords);
    saveTokens(tokens);
    saveTeacherList(teachers);
    saveSubjectList(subjects);
    saveScheduleList(schedules);

    const payload: FullBackupPayload = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      schoolConfig,
      rombels,
      students,
      users,
      attendanceRecords,
      tokens,
      teachers,
      subjects,
      schedules,
    };

    try {
      await firestoreRestoreFullBackup(payload);
      setSuccessMsg('Semua data berhasil disimpan ke browser dan disinkronkan ke Cloud Firebase (aktif di semua perangkat)!');
      onShowToast('Data berhasil disinkronkan ke Cloud & Browser!', 'success');
    } catch {
      setSuccessMsg('Data tersimpan di browser, sinkronisasi cloud akan dicoba ulang otomatis.');
      onShowToast('Data tersimpan di browser!', 'info');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div
      id="modal-backup-restore"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Pusat Cadangan & Pemulihan Data</h3>
              <p className="text-xs text-slate-400">
                Amankan data sekolah, guru, mapel, jadwal, akun siswa, dan presensi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700">
          {/* Status Banners */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Current System Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Status Database Lokal:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Aktif & Terproteksi
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-slate-900">{students.length}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Siswa</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-blue-600">{teachers.length}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Guru</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-indigo-600">{subjects.length}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Mapel</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-purple-600">{schedules.length}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Jadwal</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-slate-900">{users.length}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">User</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="block text-base font-black text-emerald-600">
                  {attendanceRecords.length}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Presensi</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 pt-1 border-t border-slate-200 flex items-center justify-between">
              <span>Sekolah: <strong>{schoolConfig.namaSekolah}</strong></span>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleForceResave}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Sinkronkan & simpan permanen ke Cloud Database & browser"
              >
                <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Menyinkronkan...' : 'Sinkronkan ke Cloud & Browser'}</span>
              </button>
            </div>
          </div>

          {/* Action 1: Export JSON */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition space-y-2 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Unduh Cadangan Data Lengkap (.JSON)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Menyimpan seluruh konfigurasi sekolah, rombel, daftar siswa, akun login pengguna,
                    dan riwayat presensi ke dalam 1 berkas aman di komputer Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="btn-download-db-backup"
                onClick={handleDownloadBackup}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
              >
                <FileJson className="w-4 h-4" />
                <span>Unduh Berkas Cadangan</span>
              </button>
            </div>
          </div>

          {/* Action 2: Import & Restore JSON */}
          <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition space-y-2 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pulihkan Data dari Berkas Cadangan (.JSON)
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Pindahkan atau pulihkan data dari komputer lain / setelah browser dibersihkan.
                    Semua profil sekolah, siswa, dan akun akan dipulihkan seketika.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="input-restore-backup-file"
              />
              <button
                id="btn-upload-db-restore"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition disabled:opacity-50"
              >
                <HardDrive className="w-4 h-4" />
                <span>{isProcessing ? 'Memproses...' : 'Pilih Berkas Cadangan JSON'}</span>
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="text-[12px] text-emerald-800 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-emerald-900">Cloud Firebase Aktif & Sinkron Otomatis</p>
              <p className="text-emerald-700 leading-relaxed">
                Setelah Admin mengunggah cadangan atau mengubah data (guru, siswa, logo, jadwal), data otomatis tersimpan di Cloud Firestore dan langsung tersinkronisasi ke seluruh perangkat. Pengguna lain di HP atau laptop berbeda <strong>cukup membuka aplikasi dan langsung menggunakannya</strong> tanpa perlu memulihkan berkas cadangan lagi.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
