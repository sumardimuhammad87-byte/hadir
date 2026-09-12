import React, { useState } from 'react';
import { Rombel, Student, UserAccount } from '../types';
import { Plus, Edit, Trash2, Users, Award, Shield, User, Sparkles, AlertCircle } from 'lucide-react';

interface ManageRombelTabProps {
  currentUser: UserAccount;
  rombels: Rombel[];
  students: Student[];
  onAddRombel: (rombel: Rombel) => void;
  onUpdateRombel: (rombel: Rombel) => void;
  onDeleteRombel: (id: string) => void;
}

export const ManageRombelTab: React.FC<ManageRombelTabProps> = ({
  currentUser,
  rombels,
  students,
  onAddRombel,
  onUpdateRombel,
  onDeleteRombel,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | null>(null);
  const [deleteConfirmRombel, setDeleteConfirmRombel] = useState<{ id: string; nama: string; studentCount: number } | null>(null);

  const [formId, setFormId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTingkat, setFormTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [formJurusan, setFormJurusan] = useState('');
  const [formWalasNama, setFormWalasNama] = useState('');
  const [formWalasNip, setFormWalasNip] = useState('');
  const [formKetuaNipd, setFormKetuaNipd] = useState('');
  const [formSekretarisNipd, setFormSekretarisNipd] = useState('');

  const openAddModal = () => {
    setEditingRombel(null);
    const newId = `ROMBEL-${Date.now().toString().slice(-4)}`;
    setFormId(newId);
    setFormNama('');
    setFormTingkat('X');
    setFormJurusan('Asisten Keperawatan');
    setFormWalasNama('');
    setFormWalasNip('');
    setFormKetuaNipd('');
    setFormSekretarisNipd('');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Rombel) => {
    setEditingRombel(r);
    setFormId(r.id);
    setFormNama(r.nama);
    setFormTingkat(r.tingkat);
    setFormJurusan(r.jurusan);
    setFormWalasNama(r.waliKelasNama || '');
    setFormWalasNip(r.waliKelasNip || '');
    setFormKetuaNipd(r.ketuaKelasNipd || '');
    setFormSekretarisNipd(r.sekretarisNipd || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) return;

    const data: Rombel = {
      id: formId,
      nama: formNama.trim(),
      tingkat: formTingkat,
      jurusan: formJurusan.trim(),
      waliKelasNama: formWalasNama.trim() || undefined,
      waliKelasNip: formWalasNip.trim() || undefined,
      ketuaKelasNipd: formKetuaNipd || undefined,
      sekretarisNipd: formSekretarisNipd || undefined,
    };

    if (editingRombel) {
      onUpdateRombel(data);
    } else {
      onAddRombel(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    const studentCount = students.filter((s) => s.rombelId === id).length;
    setDeleteConfirmRombel({ id, nama, studentCount });
  };

  // Get students eligible for class officer positions for current rombel
  const studentsInCurrentRombel = editingRombel
    ? students.filter((s) => s.rombelId === editingRombel.id)
    : students;

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Kelola Rombongan Belajar (Rombel / Kelas)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {rombels.length} Kelas Aktif
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen kelas, penetapan Wali Kelas, serta penugasan Ketua & Sekretaris Kelas untuk absensi mandiri
          </p>
        </div>

        {isAdmin && (
          <button
            id="btn-add-new-rombel"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Rombel Baru
          </button>
        )}
      </div>

      {/* Rombels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rombels.map((r) => {
          const studentList = students.filter((s) => s.rombelId === r.id);
          const ketua = students.find((s) => s.nipd === r.ketuaKelasNipd);
          const sekretaris = students.find((s) => s.nipd === r.sekretarisNipd);

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Tingkat {r.tingkat}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 leading-tight">{r.nama}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{r.jurusan}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    {studentList.length} Siswa
                  </span>
                </div>

                {/* Structure / Key Roles */}
                <div className="py-3.5 space-y-2.5 text-xs">
                  {/* Wali Kelas */}
                  <div className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Wali Kelas:</span>
                      <p className="font-bold text-slate-800">
                        {r.waliKelasNama || <span className="text-slate-400 font-normal italic">Belum ditentukan</span>}
                      </p>
                      {r.waliKelasNip && <p className="text-[10px] text-slate-500 font-mono">NIP: {r.waliKelasNip}</p>}
                    </div>
                  </div>

                  {/* Ketua Kelas */}
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Ketua Kelas:</span>
                      <p className="font-semibold text-slate-800">
                        {ketua ? (
                          <>
                            {ketua.nama}{' '}
                            <span className="text-[10px] font-mono text-emerald-700 font-bold">({ketua.nipd})</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Belum ditunjuk</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Sekretaris Kelas */}
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Sekretaris Kelas:</span>
                      <p className="font-semibold text-slate-800">
                        {sekretaris ? (
                          <>
                            {sekretaris.nama}{' '}
                            <span className="text-[10px] font-mono text-amber-700 font-bold">({sekretaris.nipd})</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Belum ditunjuk</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(r)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Rombel & Pengurus
                  </button>
                  <button
                    onClick={() => handleDelete(r.id, r.nama)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Rombel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingRombel ? `Edit Rombel: ${editingRombel.nama}` : 'Tambah Rombel Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Rombel / Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas X Farmasi A"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={formTingkat}
                    onChange={(e) => setFormTingkat(e.target.value as 'X' | 'XI' | 'XII')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jurusan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Asisten Farmasi"
                    value={formJurusan}
                    onChange={(e) => setFormJurusan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                  <input
                    type="text"
                    placeholder="Budi Santoso, S.Pd."
                    value={formWalasNama}
                    onChange={(e) => setFormWalasNama(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Wali Kelas</label>
                  <input
                    type="text"
                    placeholder="19820315..."
                    value={formWalasNip}
                    onChange={(e) => setFormWalasNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Officer Appointments */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 block">Penugasan Pengurus Kelas (Hak Akses Khusus)</span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ketua Kelas</label>
                  <select
                    value={formKetuaNipd}
                    onChange={(e) => setFormKetuaNipd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Belum Ditunjuk --</option>
                    {studentsInCurrentRombel.map((s) => (
                      <option key={s.nipd} value={s.nipd}>
                        [{s.nipd}] {s.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sekretaris Kelas</label>
                  <select
                    value={formSekretarisNipd}
                    onChange={(e) => setFormSekretarisNipd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Belum Ditunjuk --</option>
                    {studentsInCurrentRombel.map((s) => (
                      <option key={s.nipd} value={s.nipd}>
                        [{s.nipd}] {s.nama}
                      </option>
                    ))}
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rombel Confirmation Modal */}
      {deleteConfirmRombel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className={`px-5 py-4 text-white flex items-center justify-between ${
              deleteConfirmRombel.studentCount > 0 ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              <div className="flex items-center gap-2">
                {deleteConfirmRombel.studentCount > 0 ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
                <h3 className="font-bold text-sm">
                  {deleteConfirmRombel.studentCount > 0 ? 'Rombel Tidak Dapat Dihapus' : 'Konfirmasi Hapus Rombel'}
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmRombel(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              {deleteConfirmRombel.studentCount > 0 ? (
                <>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Kelas/Rombel <strong className="text-slate-900 font-bold">"{deleteConfirmRombel.nama}"</strong> masih memiliki{' '}
                    <strong className="text-amber-700 font-bold">{deleteConfirmRombel.studentCount} siswa aktif</strong> terdaftar di dalamnya.
                  </p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Silakan pindahkan plotting kelas siswa tersebut ke rombel lain terlebih dahulu sebelum menghapus rombel ini.</span>
                  </div>
                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmRombel(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Mengerti
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Apakah Anda yakin ingin menghapus kelas/rombel{' '}
                    <strong className="text-slate-900 font-bold">"{deleteConfirmRombel.nama}"</strong>?
                  </p>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Tindakan ini permanen dan akan menghapus rombel dari daftar kelas aktif.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmRombel(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      id="btn-confirm-delete-rombel"
                      type="button"
                      onClick={() => {
                        onDeleteRombel(deleteConfirmRombel.id);
                        setDeleteConfirmRombel(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Ya, Hapus Rombel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
