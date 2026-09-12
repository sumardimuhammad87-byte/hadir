import React, { useState } from 'react';
import { UserAccount, UserRole, Rombel, Student, Teacher } from '../types';
import { generateMassStudentAccounts } from '../utils/storage';
import {
  UserPlus,
  Search,
  Filter,
  Key,
  CheckCircle2,
  AlertCircle,
  Shield,
  Trash2,
  Edit,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  UserCheck,
  Building2,
  Users,
  Check,
} from 'lucide-react';

interface ManageUsersTabProps {
  currentUser: UserAccount;
  users: UserAccount[];
  students: Student[];
  rombels: Rombel[];
  teachers?: Teacher[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onSyncMassStudentAccounts: (updatedUsers: UserAccount[]) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ManageUsersTab: React.FC<ManageUsersTabProps> = ({
  currentUser,
  users,
  students,
  rombels,
  teachers = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateStudent,
  onUpdateTeacher,
  onSyncMassStudentAccounts,
  onShowToast,
}) => {
  const isAdmin = currentUser.role === 'admin';

  // Filters & Search
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [rombelFilter, setRombelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('123');
  const [massSuccessNotice, setMassSuccessNotice] = useState<string | null>(null);

  // Form states for Add User
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formPassword, setFormPassword] = useState('123456');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formRombelId, setFormRombelId] = useState<string>('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formNipd, setFormNipd] = useState('');
  const [formStatusAktif, setFormStatusAktif] = useState(true);

  // Form states for Edit User (CRUD Koreksi Nama & Akun)
  const [editNama, setEditNama] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('guru');
  const [editPassword, setEditPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editRombelId, setEditRombelId] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editNipd, setEditNipd] = useState('');
  const [editStatusAktif, setEditStatusAktif] = useState(true);
  const [editSyncStudentMaster, setEditSyncStudentMaster] = useState(true);
  const [editSyncTeacherMaster, setEditSyncTeacherMaster] = useState(true);

  // Quick Toast / Alert Helper
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (onShowToast) {
      onShowToast(msg, type);
    } else {
      setMassSuccessNotice(msg);
      setTimeout(() => setMassSuccessNotice(null), 5000);
    }
  };

  // Mass Generate Student Accounts Feature
  const handleMassGenerate = () => {
    const { updatedUsers, countAdded } = generateMassStudentAccounts(students, users);
    onSyncMassStudentAccounts(updatedUsers);
    notify(`Berhasil membuat ${countAdded} akun siswa baru secara otomatis! Sandi default: "123". Username = NIPD.`, 'success');
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setEditNama(user.nama || '');
    setEditEmail(user.email || '');
    setEditUsername(user.username || '');
    setEditRole(user.role);
    setEditPassword(user.password || '');
    setEditShowPassword(false);
    setEditRombelId(user.rombelId || '');
    setEditJabatan(user.jabatan || '');
    setEditNipd(user.nipd || '');
    setEditStatusAktif(user.statusAktif !== false);

    // Auto-check sync if user has linked student or teacher
    const hasLinkedStudent = Boolean(
      (user.nipd && students.some((s) => s.nipd === user.nipd)) ||
      (user.role === 'siswa' && students.some((s) => s.nipd === user.username))
    );
    setEditSyncStudentMaster(hasLinkedStudent);

    const hasLinkedTeacher = Boolean(
      teachers.some(
        (t) =>
          (user.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
          t.nama.toLowerCase() === user.nama.toLowerCase()
      )
    );
    setEditSyncTeacherMaster(hasLinkedTeacher);
  };

  // Submit Edit User (Koreksi Nama & Akun)
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedNama = editNama.trim();
    const trimmedUsername = editUsername.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedNama) {
      notify('Nama pengguna wajib diisi dan tidak boleh kosong!', 'error');
      return;
    }
    if (!trimmedUsername) {
      notify('Username wajib diisi!', 'error');
      return;
    }

    // Check duplicate username with other accounts
    const isDup = users.some(
      (u) =>
        u.id !== editingUser.id &&
        u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (isDup) {
      notify(`Username "${trimmedUsername}" sudah digunakan oleh akun lain! Gunakan username unik.`, 'error');
      return;
    }

    const updated: UserAccount = {
      ...editingUser,
      nama: trimmedNama,
      username: trimmedUsername,
      email: trimmedEmail,
      role: editRole,
      password: editPassword.trim() || editingUser.password || '123456',
      rombelId: editRombelId || undefined,
      jabatan: editJabatan.trim() || undefined,
      nipd: editNipd.trim() || undefined,
      statusAktif: editStatusAktif,
    };

    onUpdateUser(updated);

    // 1. Sync Student Master if requested & available
    let syncStudentNotice = '';
    if (editSyncStudentMaster && onUpdateStudent) {
      const targetNipd = updated.nipd || editingUser.nipd || (updated.role === 'siswa' ? updated.username : undefined);
      if (targetNipd) {
        const matchedStudent = students.find((s) => s.nipd === targetNipd);
        if (matchedStudent && matchedStudent.nama !== trimmedNama) {
          onUpdateStudent({
            ...matchedStudent,
            nama: trimmedNama,
            rombelId: updated.rombelId || matchedStudent.rombelId,
          });
          syncStudentNotice = ` (Nama di Data Induk Siswa juga disinkronkan)`;
        }
      }
    }

    // 2. Sync Teacher Master if requested & available
    let syncTeacherNotice = '';
    if (editSyncTeacherMaster && onUpdateTeacher && teachers.length > 0) {
      const matchedTeacher = teachers.find(
        (t) =>
          (editingUser.email && t.email.toLowerCase() === editingUser.email.toLowerCase()) ||
          t.nama.toLowerCase() === editingUser.nama.toLowerCase()
      );
      if (matchedTeacher && matchedTeacher.nama !== trimmedNama) {
        onUpdateTeacher({
          ...matchedTeacher,
          nama: trimmedNama,
          email: updated.email || matchedTeacher.email,
        });
        syncTeacherNotice = ` (Nama di Data Guru juga disinkronkan)`;
      }
    }

    setEditingUser(null);
    notify(`Data akun "${trimmedNama}" berhasil diperbarui!${syncStudentNotice}${syncTeacherNotice}`, 'success');
  };

  // Open Add User Modal
  const handleOpenAddUser = () => {
    setFormNama('');
    setFormEmail('');
    setFormUsername('');
    setFormRole('guru');
    setFormPassword('123456');
    setFormShowPassword(false);
    setFormRombelId('');
    setFormJabatan('');
    setFormNipd('');
    setFormStatusAktif(true);
    setIsAddModalOpen(true);
  };

  // Submit Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formNama) {
      notify('Nama dan Email wajib diisi!', 'error');
      return;
    }

    const cleanUsername = formUsername.trim() || formEmail.split('@')[0];
    const isDup = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (isDup) {
      notify(`Username "${cleanUsername}" sudah digunakan akun lain!`, 'error');
      return;
    }

    const newUser: UserAccount = {
      id: `USR-${Date.now()}`,
      email: formEmail.trim(),
      username: cleanUsername,
      nama: formNama.trim(),
      role: formRole,
      password: formPassword.trim() || '123456',
      rombelId: formRombelId || undefined,
      jabatan: formJabatan.trim() || undefined,
      nipd: formNipd.trim() || undefined,
      statusAktif: formStatusAktif,
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    notify(`Akun "${newUser.nama}" (${newUser.role}) berhasil ditambahkan!`, 'success');
  };

  // Reset Password Submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    const updated: UserAccount = {
      ...resetModalUser,
      password: newPassword,
      statusAktif: true,
    };
    onUpdateUser(updated);
    setResetModalUser(null);
    notify(`Sandi akun "${resetModalUser.nama}" berhasil diubah menjadi: "${newPassword}"`, 'success');
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchRombel = rombelFilter === 'ALL' || u.rombelId === rombelFilter;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.statusAktif) ||
      (statusFilter === 'INACTIVE' && !u.statusAktif);

    const term = searchTerm.toLowerCase();
    const matchSearch =
      u.nama.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.nipd && u.nipd.includes(term)) ||
      (u.jabatan && u.jabatan.toLowerCase().includes(term));

    return matchRole && matchRombel && matchStatus && matchSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Admin (Superuser)</span>;
      case 'guru':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Guru Piket/Pengajar</span>;
      case 'staf':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">Staf TU / Pimpinan</span>;
      case 'walas':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Wali Kelas</span>;
      case 'ketua_kelas':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Ketua Kelas</span>;
      case 'sekretaris':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">Sekretaris Kelas</span>;
      case 'siswa':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">Akun Siswa</span>;
      default:
        return null;
    }
  };

  const getRombelName = (id?: string) => {
    if (!id) return '-';
    return rombels.find((r) => r.id === id)?.nama || id;
  };

  // Counts by role
  const countAdmin = users.filter((u) => u.role === 'admin').length;
  const countGuru = users.filter((u) => u.role === 'guru' || u.role === 'walas').length;
  const countPengurus = users.filter((u) => u.role === 'ketua_kelas' || u.role === 'sekretaris').length;
  const countSiswa = users.filter((u) => u.role === 'siswa').length;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span>Kelola Akun Pengguna & Hak Akses (CRUD User)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {users.length} Total Akun
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat manajemen akun: tambah, edit nama pengguna (koreksi typo nama), ubah username/email, reset sandi, dan atur peran sistem.
          </p>

          {/* Quick Counter Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Admin: {countAdmin}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Guru/Walas: {countGuru}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Pengurus Kelas: {countPengurus}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Siswa: {countSiswa}
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mass Generate Student Accounts */}
            <button
              id="btn-mass-generate-students"
              onClick={handleMassGenerate}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Buat akun siswa otomatis untuk semua siswa yang belum memiliki akun login"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Buat Akun Siswa Otomatis
            </button>

            {/* Add User */}
            <button
              id="btn-add-user-modal"
              onClick={handleOpenAddUser}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Akun Baru
            </button>
          </div>
        )}
      </div>

      {/* Mass Success Notice */}
      {massSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{massSuccessNotice}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-users"
            type="text"
            placeholder="Cari nama, email, username, NIPD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-filter-user-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Peran ({users.length})</option>
              <option value="admin">Admin (Superuser)</option>
              <option value="guru">Guru Piket / Pengajar</option>
              <option value="walas">Wali Kelas</option>
              <option value="ketua_kelas">Ketua Kelas</option>
              <option value="sekretaris">Sekretaris Kelas</option>
              <option value="staf">Staf Tata Usaha</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {/* Rombel Filter */}
          <select
            id="select-filter-user-rombel"
            value={rombelFilter}
            onChange={(e) => setRombelFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Rombel/Kelas</option>
            {rombels.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="select-filter-user-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Hanya Aktif</option>
            <option value="INACTIVE">Hanya Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Email / Login ID</th>
                <th className="py-3.5 px-4">Peran (Hak Akses)</th>
                <th className="py-3.5 px-4">Rombel Terkait</th>
                <th className="py-3.5 px-4">Jabatan / Catatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-center w-44">Aksi Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-400">
                    Tidak ada akun ditemukan untuk kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{user.nama}</span>
                        {user.id === currentUser.id && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                            Anda
                          </span>
                        )}
                      </div>
                      {user.nipd && (
                        <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                          NIPD: {user.nipd}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="text-slate-700">{user.email}</div>
                      <div className="text-[10px] text-slate-400">Username: <strong className="text-slate-600 font-bold">{user.username}</strong></div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">
                        {getRombelName(user.rombelId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {user.jabatan || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.statusAktif
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.statusAktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* EDIT USER BUTTON (Koreksi Nama & Akun) */}
                          <button
                            id={`btn-edit-user-${user.id}`}
                            title={`Edit Akun & Koreksi Nama "${user.nama}"`}
                            onClick={() => handleOpenEditUser(user)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-indigo-600" />
                            Edit
                          </button>

                          {/* RESET PASSWORD BUTTON */}
                          <button
                            id={`btn-reset-pw-${user.id}`}
                            title="Reset Sandi / PIN Akun"
                            onClick={() => {
                              setResetModalUser(user);
                              setNewPassword('123');
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE BUTTON */}
                          {user.id !== currentUser.id ? (
                            <button
                              id={`btn-delete-user-${user.id}`}
                              title={`Hapus Akun "${user.nama}"`}
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-1 text-slate-300 cursor-not-allowed"
                              title="Akun sesi Anda saat ini tidak dapat dihapus"
                            >
                              <Trash2 className="w-3.5 h-3.5 opacity-30" />
                            </span>
                          )}
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

      {/* ======================================================== */}
      {/* MODAL 1: EDIT USER (CRUD KOREKSI NAMA & DATA AKUN)       */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-base">Edit Akun Pengguna</h3>
                  <p className="text-[11px] text-indigo-200">
                    Koreksi nama, username, email, hak akses, atau sandi pengguna
                  </p>
                </div>
              </div>
              <button
                id="btn-close-edit-user-modal"
                onClick={() => setEditingUser(null)}
                className="text-indigo-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              {/* Field 1: Nama Lengkap Pengguna (Utama untuk Koreksi Nama) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Nama Lengkap Pengguna *
                </label>
                <input
                  id="input-edit-user-nama"
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd / Siti Rahma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Koreksi di sini jika terdapat kesalahan ejaan atau nama pengguna. Nama ini akan tampil di dashboard dan laporan.
                </p>
              </div>

              {/* Field 2 & 3: Email & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Login *
                  </label>
                  <input
                    id="input-edit-user-email"
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login *
                  </label>
                  <input
                    id="input-edit-user-username"
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Field 4 & 5: Role & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran (Hak Akses) *
                  </label>
                  <select
                    id="select-edit-user-role"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    disabled={editingUser.id === currentUser.id && editingUser.role === 'admin'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    <option value="guru">Guru Piket / Pengajar</option>
                    <option value="walas">Wali Kelas</option>
                    <option value="staf">Staf Tata Usaha / Pimpinan</option>
                    <option value="ketua_kelas">Ketua Kelas</option>
                    <option value="sekretaris">Sekretaris Kelas</option>
                    <option value="admin">Administrator (Superuser)</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Kata Sandi / PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditShowPassword(!editShowPassword)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {editShowPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {editShowPassword ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="input-edit-user-password"
                      type={editShowPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Kata Sandi Akun"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Field 6 & 7: Rombel Terkait & Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas (Rombel) Terkait
                  </label>
                  <select
                    id="select-edit-user-rombel"
                    value={editRombelId}
                    onChange={(e) => setEditRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Tanpa Rombel Khusus --</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan / Keterangan
                  </label>
                  <input
                    id="input-edit-user-jabatan"
                    type="text"
                    value={editJabatan}
                    onChange={(e) => setEditJabatan(e.target.value)}
                    placeholder="Contoh: Wali Kelas X / Guru Biologi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Field 8: Status Aktif Akun */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Akun
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusAktifEdit"
                      checked={editStatusAktif === true}
                      onChange={() => setEditStatusAktif(true)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-emerald-700">Aktif (Dapat Login)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusAktifEdit"
                      checked={editStatusAktif === false}
                      onChange={() => setEditStatusAktif(false)}
                      disabled={editingUser.id === currentUser.id}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-700">Nonaktif (Dibekukan)</span>
                  </label>
                </div>
              </div>

              {/* Auto Sync Checkboxes for Students / Teachers */}
              {(editingUser.nipd || editingUser.role === 'siswa') && onUpdateStudent && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-teal-900">
                    <input
                      type="checkbox"
                      checked={editSyncStudentMaster}
                      onChange={(e) => setEditSyncStudentMaster(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold">Sinkronkan nama ke Master Data Siswa</span>
                      <p className="text-[10px] text-teal-700 mt-0.5">
                        Koreksi nama ini juga akan memperbarui data induk siswa (NIPD: {editingUser.nipd || editingUser.username}) di tabel siswa & presensi.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {teachers.length > 0 && onUpdateTeacher && (editingUser.role === 'guru' || editingUser.role === 'walas') && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-blue-900">
                    <input
                      type="checkbox"
                      checked={editSyncTeacherMaster}
                      onChange={(e) => setEditSyncTeacherMaster(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold">Sinkronkan nama ke Master Data Guru</span>
                      <p className="text-[10px] text-blue-700 mt-0.5">
                        Koreksi nama juga akan otomatis diperbarui pada tabel data guru pengajar & jadwal pelajaran.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  id="btn-cancel-edit-user"
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-save-edit-user"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RESET PASSWORD                                  */}
      {/* ======================================================== */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm">Reset Sandi / PIN Akun</h3>
              </div>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-amber-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <div className="text-xs text-slate-600">
                Mengatur ulang sandi untuk akun <span className="font-bold text-slate-900">{resetModalUser.nama}</span> ({resetModalUser.username}).
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Masukkan Kata Sandi / PIN Baru
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Contoh: 123"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Disarankan gunakan sandi sederhana seperti "123" untuk akun siswa yang lupa sandi.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow cursor-pointer"
                >
                  Terapkan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD NEW USER                                    */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-base">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-indigo-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Nama Lengkap Pengguna *
                </label>
                <input
                  id="input-add-user-nama"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="input-add-user-email"
                    type="email"
                    required
                    placeholder="user@sekolah.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    id="input-add-user-username"
                    type="text"
                    placeholder="username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran (Hak Akses) *
                  </label>
                  <select
                    id="select-add-user-role"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="guru">Guru Piket / Pengajar</option>
                    <option value="walas">Wali Kelas</option>
                    <option value="staf">Staf Tata Usaha / Pimpinan</option>
                    <option value="ketua_kelas">Ketua Kelas</option>
                    <option value="sekretaris">Sekretaris Kelas</option>
                    <option value="admin">Administrator (Superuser)</option>
                    <option value="siswa">Siswa</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Kata Sandi Awal</label>
                    <button
                      type="button"
                      onClick={() => setFormShowPassword(!formShowPassword)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {formShowPassword ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                  <input
                    id="input-add-user-password"
                    type={formShowPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {(formRole === 'walas' || formRole === 'ketua_kelas' || formRole === 'sekretaris' || formRole === 'siswa') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas (Rombel) Terkait
                  </label>
                  <select
                    id="select-add-user-rombel"
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Rombel --</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan / Keterangan
                </label>
                <input
                  id="input-add-user-jabatan"
                  type="text"
                  placeholder="Contoh: Guru Produktif Farmasi"
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-add-user"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow cursor-pointer"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DELETE USER CONFIRMATION                        */}
      {/* ======================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Konfirmasi Hapus Akun</h3>
              </div>
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="text-rose-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun pengguna{' '}
                <strong className="text-slate-900 font-bold">"{deleteConfirmUser.nama}"</strong>?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="text-slate-500">
                  Email/Username: <strong className="text-slate-800">{deleteConfirmUser.email || deleteConfirmUser.username}</strong>
                </div>
                <div className="text-slate-500">
                  Peran (Role): <strong className="text-slate-800 uppercase">{deleteConfirmUser.role.replace('_', ' ')}</strong>
                </div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Tindakan ini permanen. Pengguna tidak dapat masuk lagi ke sistem dengan akun ini.</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-delete-user"
                  type="button"
                  onClick={() => {
                    onDeleteUser(deleteConfirmUser.id);
                    setDeleteConfirmUser(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ya, Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
