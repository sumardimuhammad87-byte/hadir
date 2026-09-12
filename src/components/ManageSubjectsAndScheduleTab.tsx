import React, { useState } from 'react';
import { Subject, ScheduleItem, Teacher, Rombel, UserAccount, SubjectGroup, DayOfWeek } from '../types';
import {
  Calendar,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  Layers,
  GraduationCap,
  CalendarDays,
  LayoutGrid,
  List,
} from 'lucide-react';

interface ManageSubjectsAndScheduleTabProps {
  currentUser: UserAccount;
  subjects: Subject[];
  schedules: ScheduleItem[];
  teachers: Teacher[];
  rombels: Rombel[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onAddSchedule: (schedule: ScheduleItem) => void;
  onUpdateSchedule: (schedule: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ManageSubjectsAndScheduleTab: React.FC<ManageSubjectsAndScheduleTabProps> = ({
  currentUser,
  subjects,
  schedules,
  teachers,
  rombels,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onShowToast,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isSiswa = currentUser.role === 'siswa';
  const isKetuaKelas = currentUser.role === 'ketua_kelas';
  const isSekretaris = currentUser.role === 'sekretaris';
  const isLockedToRombel = isSiswa || isKetuaKelas || isSekretaris;

  const userRombelId =
    currentUser.rombelId ||
    rombels.find((r) => r.ketuaKelasNipd === currentUser.nipd)?.id ||
    rombels[0]?.id ||
    '';

  // Active subtab: 'schedules' | 'subjects'
  const [activeSubTab, setActiveSubTab] = useState<'schedules' | 'subjects'>('schedules');

  // Schedule View Mode: 'grid' (Matriks Mingguan) or 'list' (Daftar Tabel)
  const [scheduleViewMode, setScheduleViewMode] = useState<'grid' | 'list'>('grid');

  // Schedule Filter
  const [selectedRombelSchedule, setSelectedRombelSchedule] = useState<string>(
    isLockedToRombel ? userRombelId : (rombels.length > 0 ? rombels[0].id : '')
  );
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [scheduleSearch, setScheduleSearch] = useState('');

  // Subject Filter
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectGroupFilter, setSubjectGroupFilter] = useState<string>('ALL');
  const [subjectLevelFilter, setSubjectLevelFilter] = useState<string>('ALL');

  // Modals for Subject
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  // Subject Form State
  const [subjKode, setSubjKode] = useState('');
  const [subjNama, setSubjNama] = useState('');
  const [subjKelompok, setSubjKelompok] = useState<SubjectGroup>('Muatan Nasional (A)');
  const [subjTingkat, setSubjTingkat] = useState<'Semua' | 'X' | 'XI' | 'XII'>('Semua');
  const [subjJurusan, setSubjJurusan] = useState('Semua');
  const [subjJam, setSubjJam] = useState(2);
  const [subjStatusAktif, setSubjStatusAktif] = useState(true);

  // Modals for Schedule
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState<ScheduleItem | null>(null);

  // Schedule Form State
  const [schedRombelId, setSchedRombelId] = useState(selectedRombelSchedule || (rombels[0]?.id ?? ''));
  const [schedHari, setSchedHari] = useState<DayOfWeek>('Senin');
  const [schedJamKe, setSchedJamKe] = useState('1 - 2 (07:15 - 08:45)');
  const [schedJamMulai, setSchedJamMulai] = useState('07:15');
  const [schedJamSelesai, setSchedJamSelesai] = useState('08:45');
  const [schedSubjectId, setSchedSubjectId] = useState(subjects[0]?.id ?? '');
  const [schedTeacherId, setSchedTeacherId] = useState(teachers[0]?.id ?? '');
  const [schedRuangan, setSchedRuangan] = useState('Ruang Teori');
  const [schedKeterangan, setSchedKeterangan] = useState('');

  // Helpers
  const getSubject = (id: string) => subjects.find((s) => s.id === id);
  const getTeacher = (id: string) => teachers.find((t) => t.id === id);
  const getRombel = (id: string) => rombels.find((r) => r.id === id);

  // ================= SUBJECT HANDLERS =================
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjKode('');
    setSubjNama('');
    setSubjKelompok('Muatan Nasional (A)');
    setSubjTingkat('Semua');
    setSubjJurusan('Semua');
    setSubjJam(2);
    setSubjStatusAktif(true);
    setIsAddSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (s: Subject) => {
    setEditingSubject(s);
    setSubjKode(s.kode);
    setSubjNama(s.nama);
    setSubjKelompok(s.kelompok);
    setSubjTingkat(s.tingkat);
    setSubjJurusan(s.jurusan || 'Semua');
    setSubjJam(s.jamPerMinggu);
    setSubjStatusAktif(s.statusAktif);
  };

  const handleSaveSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjNama.trim() || !subjKode.trim()) {
      onShowToast('Kode dan Nama Mata Pelajaran wajib diisi!', 'error');
      return;
    }

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        kode: subjKode.trim(),
        nama: subjNama.trim(),
        kelompok: subjKelompok,
        tingkat: subjTingkat,
        jurusan: subjJurusan,
        jamPerMinggu: Number(subjJam) || 2,
        statusAktif: subjStatusAktif,
      };
      onUpdateSubject(updated);
      setEditingSubject(null);
      onShowToast(`Mata pelajaran "${updated.nama}" berhasil diperbarui`, 'success');
    } else {
      const newSubj: Subject = {
        id: `MAPEL-${Date.now()}`,
        kode: subjKode.trim(),
        nama: subjNama.trim(),
        kelompok: subjKelompok,
        tingkat: subjTingkat,
        jurusan: subjJurusan,
        jamPerMinggu: Number(subjJam) || 2,
        statusAktif: subjStatusAktif,
      };
      onAddSubject(newSubj);
      setIsAddSubjectModalOpen(false);
      onShowToast(`Mata pelajaran "${newSubj.nama}" berhasil ditambahkan!`, 'success');
    }
  };

  // ================= SCHEDULE HANDLERS =================
  const handleOpenAddSchedule = (defaultDay?: DayOfWeek) => {
    setEditingSchedule(null);
    setSchedRombelId(selectedRombelSchedule || rombels[0]?.id || '');
    setSchedHari(defaultDay || 'Senin');
    setSchedJamKe('1 - 2 (07:15 - 08:45)');
    setSchedJamMulai('07:15');
    setSchedJamSelesai('08:45');
    setSchedSubjectId(subjects[0]?.id ?? '');
    setSchedTeacherId(teachers[0]?.id ?? '');
    setSchedRuangan('Ruang Kelas');
    setSchedKeterangan('');
    setIsAddScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setSchedRombelId(item.rombelId);
    setSchedHari(item.hari);
    setSchedJamKe(item.jamKe);
    setSchedJamMulai(item.jamMulai);
    setSchedJamSelesai(item.jamSelesai);
    setSchedSubjectId(item.subjectId);
    setSchedTeacherId(item.teacherId);
    setSchedRuangan(item.ruangan);
    setSchedKeterangan(item.keterangan || '');
  };

  const handleSaveScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRombelId || !schedSubjectId || !schedTeacherId) {
      onShowToast('Kelas, Mata Pelajaran, dan Guru pengampu wajib dipilih!', 'error');
      return;
    }

    if (editingSchedule) {
      const updated: ScheduleItem = {
        ...editingSchedule,
        rombelId: schedRombelId,
        hari: schedHari,
        jamKe: schedJamKe.trim() || `${schedJamMulai} - ${schedJamSelesai}`,
        jamMulai: schedJamMulai,
        jamSelesai: schedJamSelesai,
        subjectId: schedSubjectId,
        teacherId: schedTeacherId,
        ruangan: schedRuangan.trim() || 'Ruang Kelas',
        keterangan: schedKeterangan.trim(),
      };
      onUpdateSchedule(updated);
      setEditingSchedule(null);
      onShowToast(`Jadwal pelajaran berhasil diperbarui`, 'success');
    } else {
      const newItem: ScheduleItem = {
        id: `SCH-${Date.now()}`,
        rombelId: schedRombelId,
        hari: schedHari,
        jamKe: schedJamKe.trim() || `${schedJamMulai} - ${schedJamSelesai}`,
        jamMulai: schedJamMulai,
        jamSelesai: schedJamSelesai,
        subjectId: schedSubjectId,
        teacherId: schedTeacherId,
        ruangan: schedRuangan.trim() || 'Ruang Kelas',
        keterangan: schedKeterangan.trim(),
      };
      onAddSchedule(newItem);
      setIsAddScheduleModalOpen(false);
      onShowToast(`Jadwal pelajaran baru berhasil ditambahkan!`, 'success');
    }
  };

  // Filtered Subjects
  const filteredSubjects = subjects.filter((s) => {
    const matchGroup = subjectGroupFilter === 'ALL' || s.kelompok === subjectGroupFilter;
    const matchLevel = subjectLevelFilter === 'ALL' || s.tingkat === subjectLevelFilter;
    const matchSearch =
      s.nama.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.kode.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.jurusan && s.jurusan.toLowerCase().includes(subjectSearch.toLowerCase()));
    return matchGroup && matchLevel && matchSearch;
  });

  // Filtered Schedules
  const effectiveRombel = isLockedToRombel ? userRombelId : selectedRombelSchedule;
  const filteredSchedules = schedules.filter((item) => {
    const matchRombel = !effectiveRombel || item.rombelId === effectiveRombel;
    const matchDay = selectedDayFilter === 'ALL' || item.hari === selectedDayFilter;
    const subj = getSubject(item.subjectId);
    const teacher = getTeacher(item.teacherId);
    const matchSearch =
      !scheduleSearch ||
      (subj && subj.nama.toLowerCase().includes(scheduleSearch.toLowerCase())) ||
      (!isSiswa && teacher && teacher.nama.toLowerCase().includes(scheduleSearch.toLowerCase())) ||
      item.ruangan.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      item.hari.toLowerCase().includes(scheduleSearch.toLowerCase());
    return matchRombel && matchDay && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Subtabs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>{isLockedToRombel ? `Jadwal Pelajaran Kelas ${getRombel(userRombelId)?.nama || userRombelId}` : 'Jadwal Pelajaran & Master Mata Pelajaran'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLockedToRombel
                  ? `Jadwal sesi mata pelajaran khusus rombel ${getRombel(userRombelId)?.nama || userRombelId}.`
                  : 'Kelola kurikulum mata pelajaran (Mapel) dan jadwal pelajaran mingguan per rombel kelas'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            id="subtab-schedules"
            onClick={() => setActiveSubTab('schedules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'schedules'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Jadwal Pelajaran ({schedules.length})</span>
          </button>
          {!isSiswa && (
            <button
              id="subtab-subjects"
              onClick={() => setActiveSubTab('subjects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'subjects'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mata Pelajaran ({subjects.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: JADWAL PELAJARAN ================= */}
      {activeSubTab === 'schedules' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Select Rombel or Locked Badge */}
              {isLockedToRombel ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Kelas Anda: <strong>{getRombel(userRombelId)?.nama || userRombelId}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <select
                    id="select-schedule-rombel"
                    value={selectedRombelSchedule}
                    onChange={(e) => setSelectedRombelSchedule(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} ({r.jurusan})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day filter for list mode */}
              {scheduleViewMode === 'list' && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedDayFilter}
                    onChange={(e) => setSelectedDayFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">Semua Hari</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mapel / guru..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              {/* View switcher: Grid vs List */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    scheduleViewMode === 'grid'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Matriks Mingguan"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    scheduleViewMode === 'list'
                      ? 'bg-white text-indigo-700 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Tabel Daftar"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Schedule */}
              {isAdmin && (
                <button
                  id="btn-add-schedule"
                  onClick={() => handleOpenAddSchedule()}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Jadwal</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: WEEKLY GRID VIEW (Senin - Sabtu) */}
          {scheduleViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {DAYS.filter((d) => d !== 'Sabtu').map((day) => {
                const daySchedules = filteredSchedules
                  .filter((item) => item.hari === day)
                  .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));

                return (
                  <div
                    key={day}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
                  >
                    <div className="p-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <h4 className="font-bold text-xs text-slate-800">{day}</h4>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {daySchedules.length} Sesi
                      </span>
                    </div>

                    <div className="p-3 flex-1 space-y-2.5 min-h-[220px] flex flex-col justify-start">
                      {daySchedules.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                          <Clock className="w-6 h-6 mb-1 opacity-40 text-slate-400" />
                          <p className="text-[11px]">Tidak ada jadwal pelajaran</p>
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenAddSchedule(day)}
                              className="mt-2 text-[10px] text-indigo-600 font-bold hover:underline"
                            >
                              + Tambah untuk {day}
                            </button>
                          )}
                        </div>
                      ) : (
                        daySchedules.map((item) => {
                          const subj = getSubject(item.subjectId);
                          const teacher = getTeacher(item.teacherId);

                          return (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-slate-50/50 hover:border-indigo-300 transition group relative"
                            >
                              {/* Jam & Ruangan */}
                              <div className="flex items-center justify-between text-[10px] font-mono text-indigo-700 font-semibold mb-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  {item.jamKe}
                                </span>
                                <span className="text-slate-500 font-sans text-[10px] flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {item.ruangan}
                                </span>
                              </div>

                              {/* Nama Mapel */}
                              <div className="font-bold text-xs text-slate-900 leading-tight">
                                {subj?.nama || 'Mata Pelajaran Tidak Diketahui'}
                              </div>

                              {/* Guru - Disembunyikan untuk akun siswa */}
                              {!isSiswa && (
                                <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{teacher?.nama || 'Guru Tidak Diketahui'}</span>
                                </div>
                              )}

                              {/* Keterangan jika ada */}
                              {item.keterangan && (
                                <p className="text-[10px] text-slate-500 italic mt-1 bg-white/70 p-1 rounded border border-slate-100">
                                  {item.keterangan}
                                </p>
                              )}

                              {/* Action buttons on hover */}
                              {isAdmin && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 bg-white/90 p-0.5 rounded-lg border border-slate-200 shadow-xs">
                                  <button
                                    onClick={() => handleOpenEditSchedule(item)}
                                    className="p-1 text-slate-600 hover:text-indigo-600 rounded"
                                    title="Edit Jadwal"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmSchedule(item)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Hapus Jadwal"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {isAdmin && (
                      <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                        <button
                          onClick={() => handleOpenAddSchedule(day)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          + Tambah Sesi {day}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: LIST TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">Hari & Jam</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      {!isSiswa && <th className="py-3 px-4">Guru Pengampu</th>}
                      <th className="py-3 px-4">Ruangan</th>
                      <th className="py-3 px-4">Catatan</th>
                      {isAdmin && <th className="py-3 px-4 text-center w-24">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? (isSiswa ? 7 : 8) : (isSiswa ? 6 : 7)} className="text-center py-10 text-slate-400">
                          Tidak ada jadwal ditemukan untuk filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredSchedules.map((item, idx) => {
                        const subj = getSubject(item.subjectId);
                        const teacher = getTeacher(item.teacherId);
                        const rombel = getRombel(item.rombelId);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-mono">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                                {item.hari}
                              </span>
                              <div className="text-[10px] text-slate-600 mt-0.5">{item.jamKe}</div>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                              {rombel?.nama || item.rombelId}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">
                              {subj?.nama || item.subjectId}
                              <div className="text-[10px] text-slate-400 font-normal">
                                Kode: {subj?.kode || '-'}
                              </div>
                            </td>
                            {!isSiswa && (
                              <td className="py-2.5 px-4 text-slate-700">
                                {teacher?.nama || item.teacherId}
                              </td>
                            )}
                            <td className="py-2.5 px-4 text-slate-600">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                                {item.ruangan}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 italic text-[11px]">
                              {item.keterangan || '-'}
                            </td>
                            {isAdmin && (
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditSchedule(item)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 rounded transition"
                                    title="Edit Jadwal"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmSchedule(item)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                    title="Hapus Jadwal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MASTER MATA PELAJARAN (MAPEL) ================= */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-subjects"
                type="text"
                placeholder="Cari nama mapel, kode, jurusan..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />

              {/* Kelompok Mapel */}
              <select
                value={subjectGroupFilter}
                onChange={(e) => setSubjectGroupFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Kelompok</option>
                <option value="Muatan Nasional (A)">Muatan Nasional (A)</option>
                <option value="Muatan Kewilayahan (B)">Muatan Kewilayahan (B)</option>
                <option value="Peminatan Kejuruan (C)">Peminatan Kejuruan (C)</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
              </select>

              {/* Tingkat */}
              <select
                value={subjectLevelFilter}
                onChange={(e) => setSubjectLevelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="Semua">Semua Tingkat (Umum)</option>
                <option value="X">Tingkat X</option>
                <option value="XI">Tingkat XI</option>
                <option value="XII">Tingkat XII</option>
              </select>

              {isAdmin && (
                <button
                  id="btn-add-subject"
                  onClick={handleOpenAddSubject}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer ml-auto md:ml-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mapel Baru</span>
                </button>
              )}
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Kode Mapel</th>
                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                    <th className="py-3 px-4">Kelompok Kurikulum</th>
                    <th className="py-3 px-4 text-center">Tingkat</th>
                    <th className="py-3 px-4">Jurusan / Konsentrasi</th>
                    <th className="py-3 px-4 text-center">Beban (JP)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-center w-24">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 9 : 8} className="text-center py-10 text-slate-400">
                        Tidak ada mata pelajaran ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{s.kode}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.nama}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.kelompok.includes('(C)')
                                ? 'bg-amber-100 text-amber-800'
                                : s.kelompok.includes('(A)')
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {s.kelompok}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{s.tingkat}</td>
                        <td className="py-3 px-4 text-slate-600">{s.jurusan || 'Semua'}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {s.jamPerMinggu} JP
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.statusAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.statusAktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditSubject(s)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded transition cursor-pointer"
                                title="Edit Mapel"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmSubject(s)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                title="Hapus Mapel"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SUBJECT ================= */}
      {(isAddSubjectModalOpen || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {editingSubject ? `Edit Mapel: ${editingSubject.nama}` : 'Tambah Mata Pelajaran Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddSubjectModalOpen(false);
                  setEditingSubject(null);
                }}
                className="text-indigo-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubjectSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    placeholder="FAR-01"
                    value={subjKode}
                    onChange={(e) => setSubjKode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Mata Pelajaran *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Farmakologi & Toksikologi"
                    value={subjNama}
                    onChange={(e) => setSubjNama(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kelompok Kurikulum
                </label>
                <select
                  value={subjKelompok}
                  onChange={(e) => setSubjKelompok(e.target.value as SubjectGroup)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Muatan Nasional (A)">Muatan Nasional (A)</option>
                  <option value="Muatan Kewilayahan (B)">Muatan Kewilayahan (B)</option>
                  <option value="Peminatan Kejuruan (C)">Peminatan Kejuruan (C)</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={subjTingkat}
                    onChange={(e) => setSubjTingkat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Semua">Semua Tingkat</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beban Jam (JP / Minggu)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjJam}
                    onChange={(e) => setSubjJam(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jurusan / Peminatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Asisten Farmasi"
                    value={subjJurusan}
                    onChange={(e) => setSubjJurusan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Mapel</label>
                  <select
                    value={subjStatusAktif ? '1' : '0'}
                    onChange={(e) => setSubjStatusAktif(e.target.value === '1')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1">Aktif Diajarkan</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSubjectModalOpen(false);
                    setEditingSubject(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  {editingSubject ? 'Simpan Perubahan' : 'Simpan Mapel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SCHEDULE ================= */}
      {(isAddScheduleModalOpen || editingSchedule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="px-5 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {editingSchedule ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddScheduleModalOpen(false);
                  setEditingSchedule(null);
                }}
                className="text-indigo-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveScheduleSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas (Rombel) *</label>
                  <select
                    required
                    value={schedRombelId}
                    onChange={(e) => setSchedRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hari *</label>
                  <select
                    required
                    value={schedHari}
                    onChange={(e) => setSchedHari(e.target.value as DayOfWeek)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={schedSubjectId}
                  onChange={(e) => setSchedSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.kode} - {s.nama} ({s.jamPerMinggu} JP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guru Pengampu *
                </label>
                <select
                  required
                  value={schedTeacherId}
                  onChange={(e) => setSchedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Guru Pengampu --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} (NIP: {t.nip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={schedJamMulai}
                    onChange={(e) => {
                      setSchedJamMulai(e.target.value);
                      setSchedJamKe(`( ${e.target.value} - ${schedJamSelesai} )`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={schedJamSelesai}
                    onChange={(e) => {
                      setSchedJamSelesai(e.target.value);
                      setSchedJamKe(`( ${schedJamMulai} - ${e.target.value} )`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Label Jam Ke</label>
                  <input
                    type="text"
                    placeholder="1 - 2 (07:15 - 08:45)"
                    value={schedJamKe}
                    onChange={(e) => setSchedJamKe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruangan / Lab *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Lab Farmasi Dasar"
                    value={schedRuangan}
                    onChange={(e) => setSchedRuangan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan / Materi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Praktikum resep dokter"
                    value={schedKeterangan}
                    onChange={(e) => setSchedKeterangan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddScheduleModalOpen(false);
                    setEditingSchedule(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow cursor-pointer"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SCHEDULE CONFIRMATION ================= */}
      {deleteConfirmSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hapus Jadwal Pelajaran</h3>
              </div>
              <button onClick={() => setDeleteConfirmSchedule(null)} className="text-rose-200 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus jadwal{' '}
                <strong className="text-slate-900 font-bold">
                  "{getSubject(deleteConfirmSchedule.subjectId)?.nama}"
                </strong>{' '}
                pada hari {deleteConfirmSchedule.hari} ({deleteConfirmSchedule.jamKe})?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSchedule(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSchedule(deleteConfirmSchedule.id);
                    setDeleteConfirmSchedule(null);
                    onShowToast(`Jadwal pelajaran berhasil dihapus`, 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE SUBJECT CONFIRMATION ================= */}
      {deleteConfirmSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hapus Mata Pelajaran</h3>
              </div>
              <button onClick={() => setDeleteConfirmSubject(null)} className="text-rose-200 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus mata pelajaran{' '}
                <strong className="text-slate-900 font-bold">"{deleteConfirmSubject.nama}"</strong> (
                {deleteConfirmSubject.kode})?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSubject(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSubject(deleteConfirmSubject.id);
                    setDeleteConfirmSubject(null);
                    onShowToast(`Mata pelajaran "${deleteConfirmSubject.nama}" telah dihapus`, 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Mapel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
