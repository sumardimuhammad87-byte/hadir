import React, { useState, useMemo } from 'react';
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
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  Key,
  ShieldCheck,
  Calendar,
  UserCheck,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Save,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface ManageAttendanceTabProps {
  currentUser: UserAccount;
  students: Student[];
  rombels: Rombel[];
  attendanceRecords: AttendanceRecord[];
  onSaveRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onBatchDeleteRecords: (recordIds: string[]) => void;
  onResetStudentAttendance: (nipd: string, tanggal: string) => void;
  schoolConfig?: SchoolConfig;
}

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

const COMMON_TIME_PRESETS = [
  { label: '06:45', desc: 'Pagi' },
  { label: '07:00', desc: 'Tepat' },
  { label: '07:15', desc: 'Tepat' },
  { label: '07:30', desc: 'Batas' },
  { label: '07:45', desc: 'Telat' },
  { label: '08:00', desc: 'Telat' },
  { label: '12:00', desc: 'Siang' },
];

export const ManageAttendanceTab: React.FC<ManageAttendanceTabProps> = ({
  currentUser,
  students,
  rombels,
  attendanceRecords,
  onSaveRecord,
  onDeleteRecord,
  onBatchDeleteRecords,
  onResetStudentAttendance,
}) => {
  const today = getTodayDateStr();

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'specific' | 'all'>('today');
  const [specificDate, setSpecificDate] = useState<string>(today);

  // Selection for bulk delete/action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState<boolean>(false);

  // Quick lookup maps
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.nipd, s));
    return map;
  }, [students]);

  const rombelMap = useMemo(() => {
    const map = new Map<string, Rombel>();
    rombels.forEach((r) => map.set(r.id, r));
    return map;
  }, [rombels]);

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      // Date filter
      if (dateFilterMode === 'today' && rec.tanggal !== today) {
        return false;
      }
      if (dateFilterMode === 'specific' && rec.tanggal !== specificDate) {
        return false;
      }

      // Rombel filter
      if (selectedRombel !== 'ALL' && rec.rombelId !== selectedRombel) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) {
        return false;
      }

      // Method filter
      if (selectedMethod !== 'ALL' && rec.metode !== selectedMethod) {
        return false;
      }

      // Search term (student name, NIPD, or note)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const std = studentMap.get(rec.nipd);
        const nameMatch = std?.nama.toLowerCase().includes(term) || false;
        const nipdMatch = rec.nipd.toLowerCase().includes(term);
        const noteMatch = rec.keterangan?.toLowerCase().includes(term) || false;
        if (!nameMatch && !nipdMatch && !noteMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    attendanceRecords,
    dateFilterMode,
    today,
    specificDate,
    selectedRombel,
    selectedStatus,
    selectedMethod,
    searchTerm,
    studentMap,
  ]);

  // Statistics from filtered records
  const stats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alfa = 0;

    filteredRecords.forEach((r) => {
      if (r.status === 'hadir') hadir++;
      else if (r.status === 'sakit') sakit++;
      else if (r.status === 'izin') izin++;
      else if (r.status === 'alfa') alfa++;
    });

    return { total: filteredRecords.length, hadir, sakit, izin, alfa };
  }, [filteredRecords]);

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Form State for Adding Record
  const [newNipd, setNewNipd] = useState<string>('');
  const [newTanggal, setNewTanggal] = useState<string>(today);
  const [newWaktu, setNewWaktu] = useState<string>(getCurrentTimeStr());
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('hadir');
  const [newMetode, setNewMetode] = useState<AttendanceMethod>('manual_admin');
  const [newKeterangan, setNewKeterangan] = useState<string>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');

  const eligibleStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students.slice(0, 50);
    const term = studentSearchTerm.toLowerCase();
    return students.filter(
      (s) => s.nama.toLowerCase().includes(term) || s.nipd.toLowerCase().includes(term)
    );
  }, [students, studentSearchTerm]);

  const handleOpenAddModal = () => {
    setNewNipd(students[0]?.nipd || '');
    setNewTanggal(today);
    setNewWaktu(getCurrentTimeStr());
    setNewStatus('hadir');
    setNewMetode('manual_admin');
    setNewKeterangan('');
    setStudentSearchTerm('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNipd) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    const std = studentMap.get(newNipd);
    if (!std) {
      alert('Siswa tidak valid!');
      return;
    }

    // Check if an existing record exists for same student & date
    const existing = attendanceRecords.find((r) => r.nipd === newNipd && r.tanggal === newTanggal);

    const recordId = existing ? existing.id : `ATT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const recordToSave: AttendanceRecord = {
      id: recordId,
      nipd: newNipd,
      rombelId: std.rombelId,
      tanggal: newTanggal,
      waktu: newWaktu || getCurrentTimeStr(),
      status: newStatus,
      metode: newMetode,
      recordedByRole: currentUser.role,
      recordedByName: currentUser.nama,
      keterangan: newKeterangan.trim() || undefined,
    };

    onSaveRecord(recordToSave);
    setIsAddModalOpen(false);
  };

  // Form State for Editing
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('hadir');
  const [editTanggal, setEditTanggal] = useState<string>('');
  const [editWaktu, setEditWaktu] = useState<string>('');
  const [editMetode, setEditMetode] = useState<AttendanceMethod>('manual_admin');
  const [editKeterangan, setEditKeterangan] = useState<string>('');

  const handleOpenEditModal = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditTanggal(rec.tanggal);
    setEditWaktu(rec.waktu);
    setEditMetode(rec.metode);
    setEditKeterangan(rec.keterangan || '');
  };

  const handleSaveEditedRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const std = studentMap.get(editingRecord.nipd);
    const updated: AttendanceRecord = {
      ...editingRecord,
      rombelId: std?.rombelId || editingRecord.rombelId,
      tanggal: editTanggal,
      waktu: editWaktu,
      status: editStatus,
      metode: editMetode,
      keterangan: editKeterangan.trim() || undefined,
      recordedByName: `${currentUser.nama} (Koreksi Admin)`,
      recordedByRole: currentUser.role,
    };

    onSaveRecord(updated);
    setEditingRecord(null);
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDeleteRecord(recordToDelete.id);
      setSelectedIds((prev) => prev.filter((id) => id !== recordToDelete.id));
      setRecordToDelete(null);
    }
  };

  // Batch Delete Handler
  const handleConfirmBatchDelete = () => {
    if (selectedIds.length > 0) {
      onBatchDeleteRecords(selectedIds);
      setSelectedIds([]);
      setIsBatchDeleteModalOpen(false);
    }
  };

  // Quick direct status change from row
  const handleQuickStatusChange = (rec: AttendanceRecord, newSt: AttendanceStatus) => {
    const updated: AttendanceRecord = {
      ...rec,
      status: newSt,
      recordedByName: `${currentUser.nama} (Koreksi)`,
      recordedByRole: currentUser.role,
    };
    onSaveRecord(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                HAK AKSES ADMINISTRATOR
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Pencegahan & Koreksi Kesalahan Absen
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Kelola & Koreksi Data Presensi (CRUD Absen)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pusat audit dan perbaikan data absensi siswa. Gunakan fitur ini untuk{' '}
              <strong>mengoreksi salah klik status</strong>, <strong>mengubah jam kehadiran</strong>,{' '}
              <strong>menambahkan presensi susulan</strong> (surat dokter/dispensasi), atau{' '}
              <strong>menghapus/mereset absensi</strong> yang keliru sehingga status siswa kembali normal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-add-attendance-record"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 border border-emerald-400/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Presensi Manual</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/10 px-3.5 py-2.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-medium block">Total Rekaman Terfilter</span>
            <span className="text-lg font-black text-white">{stats.total} Catatan</span>
          </div>
          <div className="bg-emerald-500/20 px-3.5 py-2.5 rounded-2xl border border-emerald-400/30">
            <span className="text-[11px] text-emerald-300 font-medium block">Hadir (H)</span>
            <span className="text-lg font-black text-emerald-200">{stats.hadir} Siswa</span>
          </div>
          <div className="bg-amber-500/20 px-3.5 py-2.5 rounded-2xl border border-amber-400/30">
            <span className="text-[11px] text-amber-300 font-medium block">Sakit (S)</span>
            <span className="text-lg font-black text-amber-200">{stats.sakit} Siswa</span>
          </div>
          <div className="bg-sky-500/20 px-3.5 py-2.5 rounded-2xl border border-sky-400/30">
            <span className="text-[11px] text-sky-300 font-medium block">Izin (I)</span>
            <span className="text-lg font-black text-sky-200">{stats.izin} Siswa</span>
          </div>
          <div className="bg-rose-500/20 px-3.5 py-2.5 rounded-2xl border border-rose-400/30 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-rose-300 font-medium block">Alfa (A)</span>
            <span className="text-lg font-black text-rose-200">{stats.alfa} Siswa</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-attendance-crud"
              type="text"
              placeholder="Cari siswa (Nama, NIPD), atau catatan keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Modes */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setDateFilterMode('today')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateFilterMode === 'today'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini ({today})
              </button>
              <button
                onClick={() => setDateFilterMode('specific')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateFilterMode === 'specific'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pilih Tanggal
              </button>
              <button
                onClick={() => setDateFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  dateFilterMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Riwayat
              </button>
            </div>

            {dateFilterMode === 'specific' && (
              <input
                id="input-specific-date-crud"
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Kelas / Rombel:</span>
            <select
              id="select-rombel-crud"
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              id="select-status-crud"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="hadir">Hadir (H)</option>
              <option value="sakit">Sakit (S)</option>
              <option value="izin">Izin (I)</option>
              <option value="alfa">Alfa (A)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Metode:</span>
            <select
              id="select-method-crud"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Metode Presensi</option>
              <option value="qr_scan">Scan QR Kamera</option>
              <option value="token">Token Mandiri Siswa</option>
              <option value="manual_admin">Manual Admin</option>
              <option value="manual_guru">Manual Guru</option>
              <option value="manual_pengurus">Pengurus Rombel</option>
            </select>
          </div>

          {/* Batch Action: Delete Selected */}
          {selectedIds.length > 0 && (
            <div className="ml-auto flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-rose-800 animate-fadeIn">
              <span className="font-bold text-xs">{selectedIds.length} data terpilih</span>
              <button
                id="btn-batch-delete"
                onClick={() => setIsBatchDeleteModalOpen(true)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRecords.length > 0 && selectedIds.length === filteredRecords.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Pilih Semua di halaman ini"
                  />
                </th>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Tanggal & Waktu</th>
                <th className="py-3.5 px-4">Data Siswa</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Status Absensi</th>
                <th className="py-3.5 px-4">Metode Rekam</th>
                <th className="py-3.5 px-4">Pencatat / Verifikator</th>
                <th className="py-3.5 px-4">Keterangan / Alasan Koreksi</th>
                <th className="py-3.5 px-4 text-center w-32">Aksi Koreksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-600">Tidak ada rekaman presensi yang cocok.</p>
                      <p className="text-[11px] text-slate-400 max-w-sm text-center">
                        Coba sesuaikan filter tanggal, rombel, atau gunakan tombol "+ Tambah Presensi Manual" untuk memasukkan data.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const student = studentMap.get(rec.nipd);
                  const rombel = rombelMap.get(rec.rombelId);
                  const isSelected = selectedIds.includes(rec.id);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(rec.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* No */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>

                      {/* Tanggal & Waktu */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(rec)}
                          className="text-left group/time cursor-pointer hover:bg-indigo-50/80 p-1.5 -m-1.5 rounded-xl transition border border-transparent hover:border-indigo-200"
                          title="Klik untuk koreksi tanggal & jam presensi ini"
                        >
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 group-hover/time:text-indigo-600">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{rec.tanggal}</span>
                            <Edit className="w-2.5 h-2.5 opacity-0 group-hover/time:opacity-100 transition text-indigo-500" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5 group-hover/time:text-indigo-700">
                            <Clock className="w-3 h-3 text-slate-400 group-hover/time:text-indigo-500" />
                            <span>{rec.waktu} WIB</span>
                          </div>
                        </button>
                      </td>

                      {/* Siswa */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {student?.nama || 'Siswa Tidak Terdaftar'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-700">
                          NIPD: {rec.nipd}
                        </div>
                        {student && (
                          <div className="text-[10px] text-slate-400">
                            {student.jk === 'L' ? 'Laki-Laki' : 'Perempuan'} • NISN: {student.nisn}
                          </div>
                        )}
                      </td>

                      {/* Kelas */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {rombel?.nama || rec.rombelId}
                        </span>
                      </td>

                      {/* Status with Quick Interactive Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          {rec.status === 'hadir' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                              Hadir (H)
                            </span>
                          )}
                          {rec.status === 'sakit' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                              Sakit (S)
                            </span>
                          )}
                          {rec.status === 'izin' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 shadow-xs">
                              Izin (I)
                            </span>
                          )}
                          {rec.status === 'alfa' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                              Alfa (A)
                            </span>
                          )}

                          {/* Quick change buttons */}
                          <div className="flex items-center gap-0.5 mt-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                            <button
                              onClick={() => handleQuickStatusChange(rec, 'hadir')}
                              title="Ubah ke Hadir"
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                rec.status === 'hadir'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-500 hover:text-emerald-700'
                              }`}
                            >
                              H
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(rec, 'sakit')}
                              title="Ubah ke Sakit"
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                rec.status === 'sakit'
                                  ? 'bg-amber-500 text-white'
                                  : 'text-slate-500 hover:text-amber-700'
                              }`}
                            >
                              S
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(rec, 'izin')}
                              title="Ubah ke Izin"
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                rec.status === 'izin'
                                  ? 'bg-sky-500 text-white'
                                  : 'text-slate-500 hover:text-sky-700'
                              }`}
                            >
                              I
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(rec, 'alfa')}
                              title="Ubah ke Alfa"
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                rec.status === 'alfa'
                                  ? 'bg-rose-600 text-white'
                                  : 'text-slate-500 hover:text-rose-700'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Metode */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {rec.metode === 'qr_scan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <QrCode className="w-3 h-3" /> QR Scan
                          </span>
                        )}
                        {rec.metode === 'token' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            <Key className="w-3 h-3" /> Token Mandiri
                          </span>
                        )}
                        {rec.metode === 'manual_admin' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            <ShieldCheck className="w-3 h-3" /> Manual Admin
                          </span>
                        )}
                        {rec.metode === 'manual_guru' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Manual Guru
                          </span>
                        )}
                        {rec.metode === 'manual_pengurus' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pengurus Rombel
                          </span>
                        )}
                      </td>

                      {/* Pencatat */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{rec.recordedByName}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                          Peran: {rec.recordedByRole}
                        </div>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3 px-4 max-w-xs">
                        {rec.keterangan ? (
                          <span className="text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded-md text-[11px] block truncate" title={rec.keterangan}>
                            {rec.keterangan}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Edit Tanggal & Jam Button */}
                          <button
                            id={`btn-edit-time-${rec.id}`}
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                            title="Koreksi Tanggal & Jam Presensi (Bisa atur jam masuk/tanggal mundur)"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          {/* Edit Full Record Button */}
                          <button
                            id={`btn-edit-attendance-${rec.id}`}
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                            title="Koreksi / Edit Presensi (Status, Jam, Tanggal, Alasan)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete / Reset Button */}
                          <button
                            id={`btn-delete-attendance-${rec.id}`}
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                            title="Hapus / Reset Absen (Siswa kembali ke status Belum Absen)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: TAMBAH PRESENSI MANUAL (CREATE)
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Tambah Rekaman Presensi Manual</h3>
                  <p className="text-xs text-slate-500">Input kehadiran susulan atau dispensasi siswa</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4 text-xs">
              {/* Cari Siswa */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Pilih Siswa:</label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik untuk memfilter nama/NIPD..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  id="modal-select-student"
                  value={newNipd}
                  onChange={(e) => setNewNipd(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {eligibleStudents.map((std) => {
                    const rombel = rombelMap.get(std.rombelId);
                    return (
                      <option key={std.nipd} value={std.nipd}>
                        {std.nipd} - {std.nama} ({rombel?.nama || std.rombelId})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tanggal & Jam */}
              <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Tanggal & Jam Masuk Presensi
                  </span>
                  <span className="text-[10px] text-slate-500">Mendukung presensi tanggal lalu</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Tanggal Presensi:</label>
                    <input
                      id="modal-input-date"
                      type="date"
                      value={newTanggal}
                      onChange={(e) => setNewTanggal(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setNewTanggal(today)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          newTanggal === today
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTanggal(getYesterdayDateStr())}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          newTanggal === getYesterdayDateStr()
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Kemarin
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTanggal(getTwoDaysAgoDateStr())}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          newTanggal === getTwoDaysAgoDateStr()
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        2 Hari Lalu
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block">Jam Masuk:</label>
                      <button
                        type="button"
                        onClick={() => setNewWaktu(getCurrentTimeStr())}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                        title="Set ke waktu sekarang"
                      >
                        <Clock className="w-3 h-3" />
                        Jam Sekarang
                      </button>
                    </div>
                    <input
                      id="modal-input-time"
                      type="text"
                      value={newWaktu}
                      onChange={(e) => setNewWaktu(e.target.value)}
                      required
                      placeholder="07:15:00"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                    />
                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                      {COMMON_TIME_PRESETS.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setNewWaktu(`${t.label}:00`)}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                            newWaktu.startsWith(t.label)
                              ? 'bg-emerald-600 text-white border-emerald-600'
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
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Status Kehadiran:</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('hadir')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      newStatus === 'hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    Hadir (H)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('sakit')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      newStatus === 'sakit'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    Sakit (S)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('izin')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      newStatus === 'izin'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    Izin (I)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('alfa')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      newStatus === 'alfa'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    Alfa (A)
                  </button>
                </div>
              </div>

              {/* Metode */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Metode Pencatatan:</label>
                <select
                  value={newMetode}
                  onChange={(e) => setNewMetode(e.target.value as AttendanceMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="manual_admin">Manual Admin (Koreksi / Susulan)</option>
                  <option value="manual_guru">Manual Guru</option>
                  <option value="qr_scan">Scan QR Kamera</option>
                  <option value="token">Token Siswa</option>
                </select>
              </div>

              {/* Keterangan / Alasan */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Keterangan / Alasan Input:</label>
                <textarea
                  value={newKeterangan}
                  onChange={(e) => setNewKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Surat dokter no. 12 diterima walas, siswa terlambat karena perbaikan jalan, dll."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan Rekaman Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT / KOREKSI PRESENSI (UPDATE)
         ========================================================================= */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Koreksi Data Presensi Siswa</h3>
                  <p className="text-xs text-slate-500">Ubah status, jam, tanggal atau keterangan alasan</p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Pill */}
            {(() => {
              const std = studentMap.get(editingRecord.nipd);
              const rombel = rombelMap.get(editingRecord.rombelId);
              return (
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{std?.nama || 'Siswa'}</div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-emerald-700 font-bold">NIPD: {editingRecord.nipd}</span>
                    <span>Kelas: {rombel?.nama || editingRecord.rombelId}</span>
                    <span className="text-[11px] text-slate-400">Pencatat awal: {editingRecord.recordedByName}</span>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleSaveEditedRecord} className="space-y-4 text-xs">
              {/* Tanggal & Jam */}
              <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Koreksi Tanggal & Jam Presensi
                  </span>
                  <span className="text-[10px] text-indigo-700 font-medium bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Bisa Ubah Tanggal & Jam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Tanggal Presensi:</label>
                    <input
                      type="date"
                      value={editTanggal}
                      onChange={(e) => setEditTanggal(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    />
                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setEditTanggal(today)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          editTanggal === today
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Hari Ini
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditTanggal(getYesterdayDateStr())}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          editTanggal === getYesterdayDateStr()
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Kemarin
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditTanggal(getTwoDaysAgoDateStr())}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          editTanggal === getTwoDaysAgoDateStr()
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        2 Hari Lalu
                      </button>
                    </div>
                  </div>

                  {/* Jam */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 block">Jam Kehadiran:</label>
                      <button
                        type="button"
                        onClick={() => setEditWaktu(getCurrentTimeStr())}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline"
                        title="Set ke jam saat ini"
                      >
                        <Clock className="w-3 h-3" />
                        Jam Sekarang
                      </button>
                    </div>
                    <input
                      type="text"
                      value={editWaktu}
                      onChange={(e) => setEditWaktu(e.target.value)}
                      required
                      placeholder="HH:mm:ss (contoh: 07:15:00)"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
                    />
                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                      {COMMON_TIME_PRESETS.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setEditWaktu(`${t.label}:00`)}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                            editWaktu.startsWith(t.label)
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
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Koreksi Status Kehadiran:</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('hadir')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      editStatus === 'hadir'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    Hadir (H)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('sakit')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      editStatus === 'sakit'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    Sakit (S)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('izin')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      editStatus === 'izin'
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    Izin (I)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('alfa')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center ${
                      editStatus === 'alfa'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    Alfa (A)
                  </button>
                </div>
              </div>

              {/* Metode */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Metode:</label>
                <select
                  value={editMetode}
                  onChange={(e) => setEditMetode(e.target.value as AttendanceMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="manual_admin">Manual Admin (Koreksi)</option>
                  <option value="manual_guru">Manual Guru</option>
                  <option value="qr_scan">Scan QR Kamera</option>
                  <option value="token">Token Siswa</option>
                  <option value="manual_pengurus">Pengurus Rombel</option>
                </select>
              </div>

              {/* Keterangan / Alasan Koreksi */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Keterangan / Alasan Koreksi:</label>
                <textarea
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  rows={2}
                  placeholder="Misal: Dikoreksi karena surat izin dokter diserahkan menyusul..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: KONFIRMASI HAPUS / RESET PRESENSI (DELETE)
         ========================================================================= */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Hapus & Reset Presensi?</h3>
                <p className="text-xs text-slate-500">Membatalkan rekaman absensi siswa yang keliru</p>
              </div>
            </div>

            {(() => {
              const std = studentMap.get(recordToDelete.nipd);
              return (
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <p>
                    Anda akan menghapus rekaman absensi untuk:
                  </p>
                  <p className="font-bold text-sm text-slate-900">
                    {std?.nama || recordToDelete.nipd} ({recordToDelete.nipd})
                  </p>
                  <p className="text-slate-600">
                    Tanggal: <strong>{recordToDelete.tanggal}</strong> • Status saat ini:{' '}
                    <strong className="uppercase">{recordToDelete.status}</strong>
                  </p>
                  <p className="text-[11px] text-rose-700 font-semibold pt-1">
                    Setelah dihapus, status siswa pada tanggal tersebut akan kembali menjadi{' '}
                    <strong>"Belum Absen"</strong>.
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: KONFIRMASI HAPUS MASSAL (BATCH DELETE)
         ========================================================================= */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Hapus {selectedIds.length} Rekaman Terpilih?</h3>
                <p className="text-xs text-slate-500">Membatalkan seluruh data presensi yang dipilih</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh <strong>{selectedIds.length} rekaman presensi</strong> yang Anda pilih akan
              dihapus dari database dan Cloud Firestore. Seluruh siswa terkait akan kembali berstatus{' '}
              <strong>"Belum Absen"</strong> pada tanggal bersangkutan. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Hapus {selectedIds.length} Rekaman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
