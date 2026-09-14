import React, { useState } from 'react';
import { UserAccount, Student, Rombel } from '../types';
import { generateMassStudentAccounts, ensureStudentUserAccount } from '../utils/storage';
import {
  Search,
  Filter,
  UserPlus,
  Key,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface ManageStudentAccountsTabProps {
  currentUser: UserAccount;
  users: UserAccount[];
  students: Student[];
  rombels: Rombel[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onSyncMassStudentAccounts: (updatedUsers: UserAccount[]) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ManageStudentAccountsTab: React.FC<ManageStudentAccountsTabProps> = ({
  currentUser,
  users,
  students,
  rombels,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateStudent,
  onSyncMassStudentAccounts,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'MISSING_ACCOUNT'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('123');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);

  // Password visibility map: [userId]: boolean
  const [showPasswordMap, setShowPasswordMap] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formStudentNipd, setFormStudentNipd] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('123');
  const [formRombelId, setFormRombelId] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);
  const [formSyncStudentMaster, setFormSyncStudentMaster] = useState(true);

  // Student accounts list from users with role === 'siswa'
  const studentAccounts = users.filter((u) => u.role === 'siswa');

  // Map of student nipd to user account
  const accountByNipd = new Map<string, UserAccount>();
  studentAccounts.forEach((u) => {
    if (u.nipd) accountByNipd.set(u.nipd.trim(), u);
    else if (u.username) accountByNipd.set(u.username.trim(), u);
  });

  // Students who do not have an account yet
  const studentsWithoutAccount = students.filter((s) => !accountByNipd.has(s.nipd.trim()));

  // Toggle show password
  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy password to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast(`Sandi/PIN "${text}" disalin ke clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Mass generate
  const handleMassGenerate = () => {
    const { updatedUsers, countAdded } = generateMassStudentAccounts(students, users);
    onSyncMassStudentAccounts(updatedUsers);
    onShowToast(
      `Berhasil membuat ${countAdded} akun siswa otomatis! Username = NIPD, Sandi = 123`,
      'success'
    );
  };

  // Reset password submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    const updated: UserAccount = {
      ...resetModalUser,
      password: newPassword,
      statusAktif: true,
    };
    onUpdateUser(updated);
    setResetModalUser(null);
    onShowToast(`PIN akun "${resetModalUser.nama}" diubah menjadi "${newPassword}"`, 'success');
  };

  // Quick 1-click Reset PIN to '123'
  const handleQuickResetPin = (user: UserAccount) => {
    const updated: UserAccount = {
      ...user,
      password: '123',
      statusAktif: true,
    };
    onUpdateUser(updated);
    onShowToast(`PIN akun "${user.nama}" berhasil di-reset ke "123"`, 'success');
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserAccount) => {
    setEditingAccount(user);
    setFormStudentNipd(user.nipd || user.username);
    setFormNama(user.nama);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPassword(user.password || '123');
    setFormRombelId(user.rombelId || '');
    setFormStatusAktif(user.statusAktif);
    setFormSyncStudentMaster(true);
  };

  // Save Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    const trimmedNama = formNama.trim();
    const updated: UserAccount = {
      ...editingAccount,
      nama: trimmedNama,
      username: formUsername.trim(),
      email: formEmail.trim(),
      password: formPassword.trim(),
      rombelId: formRombelId || undefined,
      nipd: formStudentNipd.trim() || undefined,
      statusAktif: formStatusAktif,
    };

    onUpdateUser(updated);

    // Sync Student Master Record if option checked
    let syncNote = '';
    if (formSyncStudentMaster && onUpdateStudent) {
      const targetNipd = updated.nipd || editingAccount.nipd || updated.username;
      const matched = students.find((s) => s.nipd === targetNipd);
      if (matched && matched.nama !== trimmedNama) {
        onUpdateStudent({
          ...matched,
          nama: trimmedNama,
          rombelId: updated.rombelId || matched.rombelId,
        });
        syncNote = ' (Nama di Master Data Siswa juga ikut disinkronkan)';
      }
    }

    setEditingAccount(null);
    onShowToast(`Data akun siswa "${updated.nama}" berhasil diperbarui!${syncNote}`, 'success');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormStudentNipd('');
    setFormNama('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('123');
    setFormRombelId('');
    setFormStatusAktif(true);
    setIsAddModalOpen(true);
  };

  // When student is selected in Add Modal
  const handleSelectStudentForAdd = (nipd: string) => {
    setFormStudentNipd(nipd);
    const matched = students.find((s) => s.nipd === nipd);
    if (matched) {
      setFormNama(matched.nama);
      setFormUsername(matched.nipd);
      setFormEmail(`${matched.nipd.replace(/[^a-zA-Z0-9]/g, '')}@siswa.sch.id`);
      setFormRombelId(matched.rombelId);
    }
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formUsername) {
      onShowToast('Nama dan Username/NIPD wajib diisi!', 'error');
      return;
    }

    const cleanUsername = formUsername.trim();
    // Check duplicate
    const isDup = users.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() || (u.nipd && u.nipd === cleanUsername)
    );
    if (isDup) {
      onShowToast(`Username atau NIPD "${cleanUsername}" sudah digunakan akun lain!`, 'error');
      return;
    }

    const newUser: UserAccount = {
      id: `USR-STD-${Date.now()}`,
      email: formEmail.trim() || `${cleanUsername.replace(/[^a-zA-Z0-9]/g, '')}@siswa.sch.id`,
      username: cleanUsername,
      nama: formNama.trim(),
      role: 'siswa',
      password: formPassword.trim() || '123',
      nipd: formStudentNipd.trim() || cleanUsername,
      rombelId: formRombelId || undefined,
      jabatan: 'Siswa',
      statusAktif: formStatusAktif,
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    onShowToast(`Akun siswa "${newUser.nama}" berhasil dibuat (PIN: ${newUser.password})`, 'success');
  };

  // Create single account for student without account
  const handleCreateAccountForStudent = (s: Student) => {
    const { updatedUsers, createdUser } = ensureStudentUserAccount(s, users);
    onSyncMassStudentAccounts(updatedUsers);
    onShowToast(`Akun siswa "${s.nama}" berhasil dibuat (Username: ${createdUser.username}, PIN: 123)`, 'success');
  };

  // Filter accounts
  const filteredAccounts = studentAccounts.filter((u) => {
    const matchRombel = selectedRombel === 'ALL' || u.rombelId === selectedRombel;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.statusAktif) ||
      (statusFilter === 'INACTIVE' && !u.statusAktif);

    const matchSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nipd && u.nipd.includes(searchTerm));

    return matchRombel && matchStatus && matchSearch;
  });

  const getRombelName = (id?: string) => {
    if (!id) return '-';
    return rombels.find((r) => r.id === id)?.nama || id;
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Statistics */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Manajemen CRUD Akun Siswa</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {studentAccounts.length} Akun Terdaftar
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola login siswa, ubah PIN/password, atur hak akses, dan pantau siswa yang belum memiliki akun
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Mass Generate Button */}
          {studentsWithoutAccount.length > 0 && (
            <button
              id="btn-mass-generate-missing-student-accounts"
              onClick={handleMassGenerate}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Buat akun untuk semua siswa yang belum punya akun"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Otomatisasi {studentsWithoutAccount.length} Akun Baru</span>
            </button>
          )}

          {/* Add Student Account */}
          <button
            id="btn-add-student-account"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Siswa</span>
          </button>
        </div>
      </div>

      {/* Missing Account Warning Box if any */}
      {studentsWithoutAccount.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950">
                Perhatian: Terdapat {studentsWithoutAccount.length} siswa yang belum memiliki akun login!
              </span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Siswa ini tidak dapat login ke Portal Siswa untuk presensi mandiri sampai akunnya dibuat.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter(statusFilter === 'MISSING_ACCOUNT' ? 'ALL' : 'MISSING_ACCOUNT')}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs transition cursor-pointer"
            >
              {statusFilter === 'MISSING_ACCOUNT' ? 'Tampilkan Semua Akun' : 'Lihat Siswa Belum Punya Akun'}
            </button>
            <button
              onClick={handleMassGenerate}
              className="px-3 py-1.5 rounded-xl bg-amber-700 text-white hover:bg-amber-800 font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Buat Semua Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-student-accounts"
            type="text"
            placeholder="Cari nama, NIPD, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Filter Rombel */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="select-filter-student-account-rombel"
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Semua Kelas ({studentAccounts.length})</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <select
            id="select-filter-student-account-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
            <option value="MISSING_ACCOUNT">Siswa Belum Punya Akun ({studentsWithoutAccount.length})</option>
          </select>
        </div>
      </div>

      {/* VIEW A: IF FILTERED BY MISSING ACCOUNTS */}
      {statusFilter === 'MISSING_ACCOUNT' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">
              Daftar Siswa yang Belum Memiliki Akun Login ({studentsWithoutAccount.length} Siswa)
            </span>
            <button
              onClick={handleMassGenerate}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Buat Akun untuk Semua Siswa Ini
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">NIPD / NISN</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4 text-center w-36">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {studentsWithoutAccount.map((std, idx) => (
                  <tr key={std.nipd} className="hover:bg-amber-50/30 transition">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{std.nama}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      <div>NIPD: {std.nipd}</div>
                      <div className="text-[10px] text-slate-400">NISN: {std.nisn}</div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{getRombelName(std.rombelId)}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleCreateAccountForStudent(std)}
                        className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 w-full cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Buat Akun
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW B: MAIN STUDENT ACCOUNTS TABLE */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Siswa (Nama & NIPD)</th>
                  <th className="py-3.5 px-4">Kelas (Rombel)</th>
                  <th className="py-3.5 px-4">Username & Email Login</th>
                  <th className="py-3.5 px-4">Kata Sandi / PIN</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center w-44">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Tidak ada akun siswa ditemukan untuk kriteria pencarian ini.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((user, idx) => {
                    const isPasswordShown = !!showPasswordMap[user.id];
                    const rawPassword = user.password || '123';

                      const studentPhoto = user.foto || students.find((s) => s.nipd === user.nipd)?.foto;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                                {studentPhoto ? (
                                  <img src={studentPhoto} alt={user.nama} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400">{user.nama.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{user.nama}</div>
                                <div className="text-[11px] font-mono text-teal-700 font-semibold flex items-center gap-1">
                                  <span>NIPD: {user.nipd || user.username}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {getRombelName(user.rombelId)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>User: {user.username}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-900">
                              {isPasswordShown ? rawPassword : '••••••'}
                            </span>
                            {/* Toggle password visibility */}
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(user.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                              title={isPasswordShown ? 'Sembunyikan sandi' : 'Lihat sandi'}
                            >
                              {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            {/* Copy password */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(rawPassword, user.id)}
                              className="p-1 text-slate-400 hover:text-teal-600 rounded transition cursor-pointer"
                              title="Salin kata sandi / PIN"
                            >
                              {copiedId === user.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              user.statusAktif
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {user.statusAktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Reset to '123' */}
                            <button
                              title="Reset PIN Cepat ke '123'"
                              onClick={() => handleQuickResetPin(user)}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[10px] flex items-center gap-1 border border-amber-200 transition cursor-pointer"
                            >
                              <Key className="w-3 h-3" />
                              PIN 123
                            </button>

                            {/* Edit Button */}
                            <button
                              title="Edit Detail Akun Siswa"
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer border border-transparent hover:border-teal-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              title="Hapus Akun Siswa"
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* MODAL 1: ADD NEW STUDENT ACCOUNT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-sm">Tambah Akun Siswa Baru</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-teal-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-3.5">
              {/* Option to select existing student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Dari Data Siswa (Otomatis Isi)
                </label>
                <select
                  value={formStudentNipd}
                  onChange={(e) => handleSelectStudentForAdd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Atau Ketik Manual di Bawah --</option>
                  {students.map((s) => (
                    <option key={s.nipd} value={s.nipd}>
                      {s.nipd} - {s.nama} ({getRombelName(s.rombelId)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username / NIPD *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 26.27.10.002"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi / PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas (Rombel)</label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={formStatusAktif ? '1' : '0'}
                    onChange={(e) => setFormStatusAktif(e.target.value === '1')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Akun</label>
                <input
                  type="email"
                  placeholder="siswa@sekolah.sch.id"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Simpan Akun Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT ACCOUNT */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <h3 className="font-bold text-sm">Edit Akun Siswa: {editingAccount.nama}</h3>
              </div>
              <button onClick={() => setEditingAccount(null)} className="text-teal-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Nama Lengkap Siswa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Koreksi di sini jika terdapat kesalahan ejaan atau pengetikan nama siswa.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username / NIPD Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi / PIN *</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-teal-900 bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas (Rombel)</label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keaktifan Akun</label>
                  <select
                    value={formStatusAktif ? '1' : '0'}
                    onChange={(e) => setFormStatusAktif(e.target.value === '1')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="1">Aktif (Dapat Login)</option>
                    <option value="0">Nonaktif (Login Diblokir)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Terdaftar</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {onUpdateStudent && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-teal-900">
                    <input
                      type="checkbox"
                      checked={formSyncStudentMaster}
                      onChange={(e) => setFormSyncStudentMaster(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold">Perbarui juga nama pada Master Data Siswa</span>
                      <p className="text-[10px] text-teal-700 mt-0.5">
                        Koreksi ejaan nama ini akan otomatis disinkronkan ke daftar induk siswa dan riwayat presensi.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hapus Akun Siswa</h3>
              </div>
              <button onClick={() => setDeleteConfirmUser(null)} className="text-rose-200 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Yakin ingin menghapus akun login siswa{' '}
                <strong className="text-slate-900 font-bold">"{deleteConfirmUser.nama}"</strong> (
                {deleteConfirmUser.username})?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Catatan: Data profil siswa di master data tetap tersimpan, hanya akun login ini yang dihapus.
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(deleteConfirmUser.id);
                    setDeleteConfirmUser(null);
                    onShowToast(`Akun siswa "${deleteConfirmUser.nama}" berhasil dihapus`, 'info');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
