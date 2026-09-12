import React, { useState } from 'react';
import { Student, Rombel, UserAccount } from '../types';
import { Plus, Search, Filter, Edit, Trash2, QrCode, UserCheck, ShieldAlert, Download, AlertCircle } from 'lucide-react';

interface ManageStudentsTabProps {
  currentUser: UserAccount;
  students: Student[];
  rombels: Rombel[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (nipd: string) => void;
  onSelectStudentCard: (student: Student) => void;
}

export const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({
  currentUser,
  students,
  rombels,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onSelectStudentCard,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isKetuaKelas = currentUser.role === 'ketua_kelas';
  const isSekretaris = currentUser.role === 'sekretaris';
  const isRombelLeader = isKetuaKelas || isSekretaris;

  const userRombelId =
    currentUser.rombelId ||
    students.find((s) => s.nipd === currentUser.nipd)?.rombelId ||
    rombels.find((r) => r.ketuaKelasNipd === currentUser.nipd)?.id ||
    rombels[0]?.id ||
    '';

  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>(
    isRombelLeader ? userRombelId : 'ALL'
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<{ nipd: string; nama: string } | null>(null);

  // Form states
  const [formNipd, setFormNipd] = useState<string>('');
  const [formNisn, setFormNisn] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formJk, setFormJk] = useState<'L' | 'P'>('P');
  const [formTempatLahir, setFormTempatLahir] = useState<string>('Bogor');
  const [formTanggalLahir, setFormTanggalLahir] = useState<string>('2010-01-01');
  const [formRombelId, setFormRombelId] = useState<string>(rombels[0]?.id || 'ROMBEL-X');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormNipd('');
    setFormNisn('');
    setFormNama('');
    setFormJk('P');
    setFormTempatLahir('Bogor');
    setFormTanggalLahir('2010-01-01');
    setFormRombelId(rombels[0]?.id || 'ROMBEL-X');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormNipd(student.nipd);
    setFormNisn(student.nisn);
    setFormNama(student.nama);
    setFormJk(student.jk);
    setFormTempatLahir(student.tempatLahir);
    setFormTanggalLahir(student.tanggalLahir);
    setFormRombelId(student.rombelId);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNipd.trim() || !formNama.trim() || !formNisn.trim()) {
      setErrorMessage('NIPD, NISN, dan Nama Siswa wajib diisi!');
      return;
    }

    // Check duplicate NIPD if new
    if (!editingStudent && students.some((s) => s.nipd.trim() === formNipd.trim())) {
      setErrorMessage(`NIPD "${formNipd}" sudah digunakan oleh siswa lain!`);
      return;
    }

    const studentData: Student = {
      nipd: formNipd.trim(),
      nisn: formNisn.trim(),
      nama: formNama.trim().toUpperCase(),
      jk: formJk,
      tempatLahir: formTempatLahir.trim(),
      tanggalLahir: formTanggalLahir,
      rombelId: formRombelId,
      statusAktif: true,
    };

    if (editingStudent) {
      onUpdateStudent(studentData);
    } else {
      onAddStudent(studentData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (nipd: string, nama: string) => {
    setDeleteConfirmStudent({ nipd, nama });
  };

  const filteredStudents = students.filter((s) => {
    const effectiveRombel = isRombelLeader ? userRombelId : selectedRombelFilter;
    const matchRombel = effectiveRombel === 'ALL' || s.rombelId === effectiveRombel;
    const matchSearch =
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nipd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tempatLahir.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRombel && matchSearch;
  });

  const getRombelName = (id: string) => rombels.find((r) => r.id === id)?.nama || id;

  const exportStudentsCsv = () => {
    const headers = ['No', 'NIPD', 'NISN', 'Nama Siswa', 'JK', 'Tempat Lahir', 'Tanggal Lahir', 'Kelas'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.nipd}"`,
      `"${s.nisn}"`,
      `"${s.nama}"`,
      s.jk,
      `"${s.tempatLahir}"`,
      s.tanggalLahir,
      `"${getRombelName(s.rombelId)}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_${selectedRombelFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{isRombelLeader ? `Data Siswa Rombel: ${getRombelName(userRombelId)}` : 'Kelola Master Siswa & Plotting Rombel'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredStudents.length} Siswa Terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRombelLeader
              ? `Ruang lingkup terbatas pada rombel ${getRombelName(userRombelId)} sesuai hak akses Ketua Kelas / Pengurus.`
              : 'Manajemen data pokok siswa dengan identitas unik NIPD (Primary Key) untuk sistem absensi QR Code'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-students-csv"
            onClick={exportStudentsCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {isAdmin && (
            <button
              id="btn-add-new-student"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-master-students"
            type="text"
            placeholder="Cari nama, NIPD, NISN, kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isRombelLeader ? (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rombel Anda: <strong>{getRombelName(userRombelId)}</strong></span>
            </div>
          ) : (
            <>
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Filter Rombel:</span>
              <select
                id="select-filter-rombel-master"
                value={selectedRombelFilter}
                onChange={(e) => setSelectedRombelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Kelas ({students.length})</option>
                {rombels.map((r) => {
                  const count = students.filter((s) => s.rombelId === r.id).length;
                  return (
                    <option key={r.id} value={r.id}>
                      {r.nama} ({count})
                    </option>
                  );
                })}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Students Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">NIPD (Primary Key)</th>
                <th className="py-3.5 px-4">Nama Lengkap Siswa</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">JK</th>
                <th className="py-3.5 px-4">Tempat, Tanggal Lahir</th>
                <th className="py-3.5 px-4">Plotting Rombel</th>
                <th className="py-3.5 px-4 text-center">QR & Kartu</th>
                {isAdmin && <th className="py-3.5 px-4 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="text-center py-10 text-slate-400">
                    Tidak ada siswa yang sesuai dengan pencarian atau filter rombel.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => (
                  <tr key={std.nipd} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {std.nipd}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {std.nama}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {std.nisn}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {std.jk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {std.tempatLahir}, {std.tanggalLahir}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {getRombelName(std.rombelId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        title="Lihat QR Code & Kartu Pelajar"
                        onClick={() => onSelectStudentCard(std)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR
                      </button>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Edit Data Siswa"
                            onClick={() => openEditModal(std)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Hapus Siswa"
                            onClick={() => handleDelete(std.nipd, std.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIPD (Primary Key) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    placeholder="Contoh: 26.27.10.014"
                    value={formNipd}
                    onChange={(e) => setFormNipd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0117573036"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SITI NURHALIZA"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJk}
                    onChange={(e) => setFormJk(e.target.value as 'L' | 'P')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="P">Perempuan (P)</option>
                    <option value="L">Laki-Laki (L)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plotting Kelas (Rombel) *
                  </label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formTempatLahir}
                    onChange={(e) => setFormTempatLahir(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formTanggalLahir}
                    onChange={(e) => setFormTanggalLahir(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Hapus Data Siswa</h3>
              </div>
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="text-rose-200 hover:text-white p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus data siswa{' '}
                <strong className="text-slate-900 font-bold">"{deleteConfirmStudent.nama}"</strong> (NIPD: {deleteConfirmStudent.nipd})?
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Tindakan ini permanen dan akan menghapus catatan data pokok siswa tersebut.</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmStudent(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-delete-student"
                  type="button"
                  onClick={() => {
                    onDeleteStudent(deleteConfirmStudent.nipd);
                    setDeleteConfirmStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ya, Hapus Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
