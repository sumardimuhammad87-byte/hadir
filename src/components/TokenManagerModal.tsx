import React, { useState } from 'react';
import { AttendanceToken, Rombel, UserAccount } from '../types';
import { X, Key, Copy, Check, Clock, Trash2, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface TokenManagerModalProps {
  currentUser: UserAccount;
  rombels: Rombel[];
  tokens?: AttendanceToken[];
  activeTokens?: AttendanceToken[];
  onAddToken?: (token: AttendanceToken) => void;
  onCreateToken?: (token: AttendanceToken) => void;
  onRevokeToken?: (tokenId: string) => void;
  onDeleteToken?: (tokenId: string) => void;
  isOpen?: boolean;
  onClose: () => void;
}

export const TokenManagerModal: React.FC<TokenManagerModalProps> = ({
  currentUser,
  rombels,
  tokens,
  activeTokens,
  onAddToken,
  onCreateToken,
  onRevokeToken,
  onDeleteToken,
  onClose,
}) => {
  // Support both prop naming conventions safely
  const effectiveTokens = activeTokens || tokens || [];
  const handleAdd = onAddToken || onCreateToken;
  const handleRevoke = onRevokeToken || onDeleteToken;

  // Determine allowed rombels based on role (walas, ketua_kelas, and sekretaris are strictly locked to their rombel)
  const isRestrictedRole =
    currentUser.role === 'walas' ||
    currentUser.role === 'ketua_kelas' ||
    currentUser.role === 'sekretaris';

  const assignedRombel =
    rombels.find((r) => {
      if (currentUser.rombelId && r.id === currentUser.rombelId) return true;
      if (currentUser.role === 'walas' && currentUser.nipd && r.waliKelasNip === currentUser.nipd) return true;
      if (currentUser.role === 'walas' && currentUser.nama && r.waliKelasNama === currentUser.nama) return true;
      if (currentUser.role === 'ketua_kelas' && currentUser.nipd && r.ketuaKelasNipd === currentUser.nipd) return true;
      if (currentUser.role === 'sekretaris' && currentUser.nipd && r.sekretarisNipd === currentUser.nipd) return true;
      return false;
    }) ||
    (currentUser.rombelId ? rombels.find((r) => r.id === currentUser.rombelId) : undefined) ||
    rombels[0];

  const assignedRombelId = assignedRombel?.id || currentUser.rombelId || 'ROMBEL-XI-FAR';

  const [targetRombel, setTargetRombel] = useState<string>(
    isRestrictedRole ? assignedRombelId : 'ALL'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customCode, setCustomCode] = useState<string>('');
  const [useCustomCode, setUseCustomCode] = useState<boolean>(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [createdSuccessToken, setCreatedSuccessToken] = useState<AttendanceToken | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate a new token
  const handleGenerate = () => {
    setErrorMessage(null);
    let tokenCode = '';

    if (useCustomCode) {
      const clean = customCode.trim().toUpperCase();
      if (!clean) {
        setErrorMessage('Silakan ketik kode token kustom Anda (contoh: FARMA1 atau MASUK-XI).');
        return;
      }
      if (clean.length < 3) {
        setErrorMessage('Kode token minimal 3 karakter.');
        return;
      }
      tokenCode = clean;
    } else {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      tokenCode = `TK-${randomDigits}`;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const newToken: AttendanceToken = {
      id: `TOK-${Date.now()}`,
      token: tokenCode,
      rombelId: isRestrictedRole ? assignedRombelId : targetRombel,
      createdBy: currentUser.nama,
      createdRole: currentUser.role,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
    };

    if (handleAdd) {
      handleAdd(newToken);
    }

    setCreatedSuccessToken(newToken);
    setCustomCode('');
    setUseCustomCode(false);
  };

  const handleCopy = (token: AttendanceToken) => {
    navigator.clipboard.writeText(token.token);
    setCopiedTokenId(token.id);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  const getRombelLabel = (id: string) => {
    if (id === 'ALL') return 'Semua Kelas (Global)';
    return rombels.find((r) => r.id === id)?.nama || id;
  };

  const nowTime = new Date().getTime();

  const visibleTokens = effectiveTokens.filter((tok) => {
    if (isRestrictedRole) {
      return tok.rombelId === assignedRombelId || (currentUser.rombelId && tok.rombelId === currentUser.rombelId);
    }
    return true;
  });

  return (
    <div id="modal-token-manager" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-indigo-200" />
            <div>
              <h3 className="font-semibold text-lg leading-tight">Generator & Kelola Token Absensi</h3>
              <p className="text-xs text-indigo-100">Token digunakan siswa untuk absensi mandiri di portal siswa</p>
            </div>
          </div>
          <button
            id="btn-close-token-manager"
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-indigo-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Restriction notice for walas, ketua kelas, and sekretaris */}
          {isRestrictedRole && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Hak Akses Terbatas ({currentUser.jabatan || currentUser.role.toUpperCase()}):</span> Anda hanya berwenang membuat token presensi khusus untuk rombel yang Anda pimpin:{' '}
                <span className="font-bold text-indigo-900">{getRombelLabel(assignedRombelId)}</span>.
              </div>
            </div>
          )}

          {/* Success banner after token is created */}
          {createdSuccessToken && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl animate-in zoom-in-95 duration-200 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Token Berhasil Dibuat & Aktif!
                </span>
                <button
                  type="button"
                  onClick={() => setCreatedSuccessToken(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                    KODE TOKEN (BAGIKAN KE SISWA)
                  </span>
                  <span className="text-2xl font-mono font-black text-indigo-900 tracking-wider">
                    {createdSuccessToken.token}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(createdSuccessToken)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {copiedTokenId === createdSuccessToken.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Kode
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-emerald-800 flex items-center justify-between font-medium">
                <span>Target: <strong>{getRombelLabel(createdSuccessToken.rombelId)}</strong></span>
                <span>Berlaku s/d: <strong>{new Date(createdSuccessToken.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong></span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form to generate new token */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                Buat Token Absensi Baru
              </h4>
              <button
                type="button"
                onClick={() => setUseCustomCode(!useCustomCode)}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold underline cursor-pointer"
              >
                {useCustomCode ? 'Gunakan Kode Acak Otomatis' : 'Gunakan Kode Khusus / Kustom'}
              </button>
            </div>

            {useCustomCode && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Kode Token Khusus (Kustom)</label>
                <input
                  type="text"
                  placeholder="Contoh: MASUK11, HADIRFARMA"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Kelas (Rombel)</label>
                {isRestrictedRole ? (
                  <input
                    type="text"
                    disabled
                    value={getRombelLabel(assignedRombelId)}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                ) : (
                  <select
                    id="select-token-target-rombel"
                    value={targetRombel}
                    onChange={(e) => setTargetRombel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Kelas (Global)</option>
                    {rombels.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Masa Berlaku Token</label>
                <select
                  id="select-token-duration"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={15}>15 Menit</option>
                  <option value={30}>30 Menit (Standar Masuk)</option>
                  <option value={60}>1 Jam</option>
                  <option value={120}>2 Jam</option>
                  <option value={480}>8 Jam (Seharian Penuh)</option>
                </select>
              </div>
            </div>

            <button
              id="btn-generate-token-submit"
              type="button"
              onClick={handleGenerate}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              {useCustomCode ? 'Aktifkan Token Kustom Sekarang' : 'Generate Token Baru Sekarang'}
            </button>
          </div>

          {/* Active Tokens List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Token Absensi Aktif ({visibleTokens.length})
              </h4>
            </div>

            {visibleTokens.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                Belum ada token aktif. Buat token di atas untuk mengizinkan siswa absen mandiri.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {visibleTokens.map((tok) => {
                  const isExpired = new Date(tok.expiresAt).getTime() < nowTime;
                  return (
                    <div
                      key={tok.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition ${
                        isExpired ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-indigo-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-mono font-bold text-sm rounded-lg tracking-wider border border-indigo-300">
                          {tok.token}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-900">
                              {getRombelLabel(tok.rombelId)}
                            </span>
                            {isExpired ? (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                Kedaluwarsa
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Hingga {new Date(tok.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>• Oleh {tok.createdBy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          title="Salin Token"
                          type="button"
                          onClick={() => handleCopy(tok)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        >
                          {copiedTokenId === tok.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {handleRevoke && (
                          <button
                            title="Hapus / Cabut Token"
                            type="button"
                            onClick={() => handleRevoke(tok.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
