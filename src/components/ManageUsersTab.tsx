import React, { useState } from 'react';
import { UserAccount, UserRole, Rombel, Student } from '../types';
import { generateMassStudentAccounts } from '../utils/storage';
import { UserPlus, Search, Filter, Key, CheckCircle2, AlertCircle, RefreshCw, Shield, Trash2, Edit, Users, Sparkles } from 'lucide-react';

interface ManageUsersTabProps {
  currentUser: UserAccount;
  users: UserAccount[];
  students: Student[];
  rombels: Rombel[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (id: string) => void;
  onSyncMassStudentAccounts: (updatedUsers: UserAccount[]) => void;
}

export const ManageUsersTab: React.FC<ManageUsersTabProps> = ({
  currentUser,
  users,
  students,
  rombels,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSyncMassStudentAccounts,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('123');
  const [massSuccessNotice, setMassSuccessNotice] = useState<string | null>(null);

  // Form states for new user
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formPassword, setFormPassword] = useState('123456');
  const [formRombelId, setFormRombelId] = useState<string>('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formNipd, setFormNipd] = useState('');

  // Mass Generate Student Accounts Feature
  const handleMassGenerate = () => {
    const { updatedUsers, countAdded } = generateMassStudentAccounts(students, users);
    onSyncMassStudentAccounts(updatedUsers);
    setMassSuccessNotice(`Berhasil membuat ${countAdded} akun siswa baru secara otomatis! Sandi default: "123". Username = NIPD.`);
    setTimeout(() => setMassSuccessNotice(null), 6000);
  };

  // Reset password
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
    setMassSuccessNotice(`Sandi akun "${resetModalUser.nama}" berhasil diubah menjadi: "${newPassword}"`);
    setTimeout(() => setMassSuccessNotice(null), 5000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formNama) return;

    const newUser: UserAccount = {
      id: `USR-${Date.now()}`,
      email: formEmail.trim(),
      username: formUsername.trim() || formEmail.split('@')[0],
      nama: formNama.trim(),
      role: formRole,
      password: formPassword,
      rombelId: formRombelId || undefined,
      jabatan: formJabatan || undefined,
      nipd: formNipd || undefined,
      statusAktif: true,
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.nipd && u.nipd.includes(searchTerm));
    return matchRole && matchSearch;
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

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span>Kelola Pengguna & Hak Akses (Role-Based)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {users.length} Akun
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen akun Admin, Guru, Wali Kelas, Ketua/Sekretaris Kelas, dan Siswa beserta reset sandi bermasalah
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mass Generate Student Accounts */}
            <button
              id="btn-mass-generate-students"
              onClick={handleMassGenerate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Buat Akun Siswa Otomatis (Massal)
            </button>

            {/* Add User */}
            <button
              id="btn-add-user-modal"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Akun
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
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-users"
            type="text"
            placeholder="Cari nama, email, username, NIPD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">Filter Peran (Role):</span>
          <select
            id="select-filter-user-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Email / Username</th>
                <th className="py-3.5 px-4">Peran (Hak Akses)</th>
                <th className="py-3.5 px-4">Rombel Terkait</th>
                <th className="py-3.5 px-4">Jabatan / Catatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-center w-36">Aksi Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-400">
                    Tidak ada akun ditemukan untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.nama}</div>
                      {user.nipd && (
                        <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                          NIPD: {user.nipd}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{user.email}</div>
                      <div className="text-[10px] text-slate-400">User: {user.username}</div>
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
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reset Password Button */}
                          <button
                            title="Reset Sandi / PIN Akun"
                            onClick={() => {
                              setResetModalUser(user);
                              setNewPassword('123');
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            Reset
                          </button>

                          {user.id !== currentUser.id ? (
                            <button
                              id={`btn-delete-user-${user.id}`}
                              title={`Hapus Akun "${user.nama}"`}
                              onClick={() => setDeleteConfirmUser(user)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200"
                              title="Akun Anda yang sedang aktif saat ini (tidak dapat dihapus sendiri)"
                            >
                              Sesi Anda
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

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-5 py-4 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <h3 className="font-bold text-sm">Reset Sandi / Pemulihan Akun</h3>
              </div>
              <button onClick={() => setResetModalUser(null)} className="text-amber-200 hover:text-white">
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
                  Disarankan gunakan PIN sederhana seperti "123" untuk akun siswa yang lupa sandi.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Terapkan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Akun Pengguna Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-purple-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pengguna / Guru"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@sekolah.sch.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    placeholder="username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peran (Hak Akses) *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Awal</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {(formRole === 'walas' || formRole === 'ketua_kelas' || formRole === 'sekretaris' || formRole === 'siswa') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas (Rombel) Terkait</label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Guru Produktif Farmasi"
                  value={formJabatan}
                  onChange={(e) => setFormJabatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
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
                className="text-rose-200 hover:text-white p-1 rounded-lg transition"
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
                <span>Tindakan ini bersifat permanen. Pengguna tidak akan dapat masuk kembali ke sistem.</span>
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
