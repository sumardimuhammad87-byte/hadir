import React, { useState } from 'react';
import { Teacher, Rombel, UserAccount, Subject } from '../types';
import { ensureTeacherUserAccount } from '../utils/storage';
import {
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ManageTeachersTabProps {
  currentUser: UserAccount;
  teachers: Teacher[];
  rombels: Rombel[];
  subjects: Subject[];
  users: UserAccount[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onSyncUsers: (updatedUsers: UserAccount[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ManageTeachersTab: React.FC<ManageTeachersTabProps> = ({
  currentUser,
  teachers,
  rombels,
  subjects,
  users,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onSyncUsers,
  onShowToast,
}) => {
  const isAdmin = currentUser.role === 'admin';

  if (currentUser.role === 'siswa') {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Akses Dibatasi</h3>
        <p className="text-xs text-slate-500 mt-1">
          Akun siswa tidak diperkenankan untuk melihat atau mengakses direktori data guru.
        </p>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusKep, setFilterStatusKep] = useState<string>('ALL');
  const [filterJk, setFilterJk] = useState<string>('ALL');
  const [filterWaliKelas, setFilterWaliKelas] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteConfirmTeacher, setDeleteConfirmTeacher] = useState<Teacher | null>(null);

  // Form states
  const [formNip, setFormNip] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJk, setFormJk] = useState<'L' | 'P'>('L');
  const [formStatusKep, setFormStatusKep] = useState<'PNS' | 'PPPK' | 'GTT' | 'GTY' | 'Honorer'>('PNS');
  const [formMataPelajaran, setFormMataPelajaran] = useState<string[]>([]);
  const [formSubjectInput, setFormSubjectInput] = useState('');
  const [formRombelWaliKelasId, setFormRombelWaliKelasId] = useState<string>('');
  const [formTelepon, setFormTelepon] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);
  const [autoCreateUserAccount, setAutoCreateUserAccount] = useState(true);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormNip('');
    setFormNama('');
    setFormJk('L');
    setFormStatusKep('PNS');
    setFormMataPelajaran([]);
    setFormSubjectInput('');
    setFormRombelWaliKelasId('');
    setFormTelepon('');
    setFormEmail('');
    setFormStatusAktif(true);
    setAutoCreateUserAccount(true);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormNip(t.nip);
    setFormNama(t.nama);
    setFormJk(t.jk);
    setFormStatusKep(t.statusKepegawaian);
    setFormMataPelajaran(t.mataPelajaran || []);
    setFormSubjectInput('');
    setFormRombelWaliKelasId(t.rombelWaliKelasId || '');
    setFormTelepon(t.telepon);
    setFormEmail(t.email);
    setFormStatusAktif(t.statusAktif);
    setAutoCreateUserAccount(true);
  };

  // Add subject tag
  const handleAddSubjectTag = (subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed || formMataPelajaran.includes(trimmed)) return;
    setFormMataPelajaran([...formMataPelajaran, trimmed]);
    setFormSubjectInput('');
  };

  // Remove subject tag
  const handleRemoveSubjectTag = (subjectName: string) => {
    setFormMataPelajaran(formMataPelajaran.filter((s) => s !== subjectName));
  };

  // Submit Add Teacher
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNip.trim()) {
      onShowToast('Nama dan NIP/NUPTK wajib diisi!', 'error');
      return;
    }

    const newTeacher: Teacher = {
      id: `GUR-${Date.now()}`,
      nip: formNip.trim(),
      nama: formNama.trim(),
      jk: formJk,
      statusKepegawaian: formStatusKep,
      mataPelajaran: formMataPelajaran.length > 0 ? formMataPelajaran : ['Umum'],
      rombelWaliKelasId: formRombelWaliKelasId || undefined,
      telepon: formTelepon.trim() || '081234567890',
      email: formEmail.trim() || `${formNip.replace(/\s+/g, '')}@smkhusada.sch.id`,
      statusAktif: formStatusAktif,
    };

    onAddTeacher(newTeacher);

    if (autoCreateUserAccount) {
      const { updatedUsers } = ensureTeacherUserAccount(newTeacher, users);
      onSyncUsers(updatedUsers);
    }

    setIsAddModalOpen(false);
    onShowToast(`Guru "${newTeacher.nama}" berhasil ditambahkan!`, 'success');
  };

  // Submit Edit Teacher
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const updated: Teacher = {
      ...editingTeacher,
      nip: formNip.trim(),
      nama: formNama.trim(),
      jk: formJk,
      statusKepegawaian: formStatusKep,
      mataPelajaran: formMataPelajaran.length > 0 ? formMataPelajaran : ['Umum'],
      rombelWaliKelasId: formRombelWaliKelasId || undefined,
      telepon: formTelepon.trim(),
      email: formEmail.trim(),
      statusAktif: formStatusAktif,
    };

    onUpdateTeacher(updated);

    if (autoCreateUserAccount) {
      const { updatedUsers } = ensureTeacherUserAccount(updated, users);
      onSyncUsers(updatedUsers);
    }

    setEditingTeacher(null);
    onShowToast(`Data guru "${updated.nama}" berhasil diperbarui`, 'success');
  };

  // Bulk sync all teachers to user accounts
  const handleSyncAllTeacherAccounts = () => {
    let curr = [...users];
    teachers.forEach((t) => {
      const { updatedUsers } = ensureTeacherUserAccount(t, curr);
      curr = updatedUsers;
    });
    onSyncUsers(curr);
    onShowToast(`Berhasil menyinkronkan akun login untuk ${teachers.length} guru!`, 'success');
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchStatusKep = filterStatusKep === 'ALL' || t.statusKepegawaian === filterStatusKep;
    const matchJk = filterJk === 'ALL' || t.jk === filterJk;
    const matchWali =
      filterWaliKelas === 'ALL' ||
      (filterWaliKelas === 'YES' && !!t.rombelWaliKelasId) ||
      (filterWaliKelas === 'NO' && !t.rombelWaliKelasId);

    const matchSearch =
      t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mataPelajaran.some((mp) => mp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.telepon.includes(searchTerm);

    return matchStatusKep && matchJk && matchWali && matchSearch;
  });

  const getRombelName = (id?: string) => {
    if (!id) return null;
    return rombels.find((r) => r.id === id)?.nama || id;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Manajemen Master Data Guru & Pendidik</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {teachers.length} Guru
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data pengajar, NIP/NUPTK, bidang studi mata pelajaran, tugas wali kelas, dan akun login pendidik
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sync login accounts */}
            <button
              id="btn-sync-teacher-accounts"
              onClick={handleSyncAllTeacherAccounts}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Pastikan semua guru memiliki akun login"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Sinkron Akun Login Guru</span>
            </button>

            {/* Add Teacher */}
            <button
              id="btn-add-teacher"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-teachers"
            type="text"
            placeholder="Cari nama guru, NIP, mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />

          {/* Filter Status Kepegawaian */}
          <select
            id="select-filter-teacher-status"
            value={filterStatusKep}
            onChange={(e) => setFilterStatusKep(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kepegawaian</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="GTT">GTT</option>
            <option value="GTY">GTY</option>
            <option value="Honorer">Honorer</option>
          </select>

          {/* Filter Wali Kelas */}
          <select
            id="select-filter-teacher-wali"
            value={filterWaliKelas}
            onChange={(e) => setFilterWaliKelas(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Guru</option>
            <option value="YES">Hanya Wali Kelas</option>
            <option value="NO">Bukan Wali Kelas</option>
          </select>

          {/* Filter JK */}
          <select
            id="select-filter-teacher-jk"
            value={filterJk}
            onChange={(e) => setFilterJk(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">L & P</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Lengkap & NIP</th>
                <th className="py-3.5 px-4 text-center">L/P</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Mata Pelajaran yang Diampu</th>
                <th className="py-3.5 px-4">Tugas Tambahan</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-center w-28">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="text-center py-10 text-slate-400">
                    Tidak ada data guru yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => {
                  const rombelName = getRombelName(t.rombelWaliKelasId);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.nama}</div>
                        <div className="text-[11px] font-mono text-slate-500">NIP: {t.nip}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.jk === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {t.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {t.statusKepegawaian}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.mataPelajaran.map((mp, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {mp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {rombelName ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                            Walas {rombelName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        <div className="text-slate-700 flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {t.telepon}
                        </div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {t.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.statusAktif
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {t.statusAktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              title="Edit Data Guru"
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Hapus Data Guru"
                              onClick={() => setDeleteConfirmTeacher(t)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
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

      {/* MODAL: ADD / EDIT TEACHER */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  {editingTeacher ? `Edit Data Guru: ${editingTeacher.nama}` : 'Tambah Data Guru Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingTeacher ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Apt. Siti Rohmah, S.Farm."
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="19880421 201102 2 006"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJk}
                    onChange={(e) => setFormJk(e.target.value as 'L' | 'P')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formStatusKep}
                    onChange={(e) => setFormStatusKep(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tugas Wali Kelas
                  </label>
                  <select
                    value={formRombelWaliKelasId}
                    onChange={(e) => setFormRombelWaliKelasId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Bukan Wali Kelas --</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mata Pelajaran Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran yang Diampu
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formMataPelajaran.map((mp, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1.5"
                    >
                      {mp}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectTag(mp)}
                        className="hover:text-rose-600 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {/* Select from existing subjects or type new */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSubjectTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">+ Pilih dari Daftar Mapel</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.nama}>
                        {s.nama} ({s.kode})
                      </option>
                    ))}
                  </select>

                  <div className="w-1/2 flex gap-1">
                    <input
                      type="text"
                      placeholder="Atau ketik mapel baru..."
                      value={formSubjectInput}
                      onChange={(e) => setFormSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubjectTag(formSubjectInput);
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubjectTag(formSubjectInput)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Guru
                  </label>
                  <input
                    type="email"
                    placeholder="guru@smkhusada.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Otomatis Buat / Sinkron Akun Login Guru
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Password default akun: <span className="font-mono font-bold text-blue-700">guru123</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoCreateUserAccount}
                  onChange={(e) => setAutoCreateUserAccount(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow cursor-pointer"
                >
                  {editingTeacher ? 'Simpan Perubahan' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hapus Data Guru</h3>
              </div>
              <button onClick={() => setDeleteConfirmTeacher(null)} className="text-rose-200 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus data guru{' '}
                <strong className="text-slate-900 font-bold">"{deleteConfirmTeacher.nama}"</strong> (
                {deleteConfirmTeacher.nip})?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTeacher(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTeacher(deleteConfirmTeacher.id);
                    setDeleteConfirmTeacher(null);
                    onShowToast(`Data guru "${deleteConfirmTeacher.nama}" telah dihapus`, 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Guru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
