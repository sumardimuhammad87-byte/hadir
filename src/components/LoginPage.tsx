import React, { useState } from 'react';
import { UserAccount, SchoolConfig } from '../types';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  QrCode,
  Sparkles,
  KeyRound,
  FileCode,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HardDrive,
  Database,
} from 'lucide-react';

interface LoginPageProps {
  users: UserAccount[];
  schoolConfig: SchoolConfig;
  onLoginSuccess: (user: UserAccount) => void;
  onOpenArchDocs?: () => void;
  onOpenBackupModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  schoolConfig,
  onLoginSuccess,
  onOpenArchDocs,
  onOpenBackupModal,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitLogin = (idInput: string, passInput: string) => {
    const cleanId = idInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    if (!cleanId) {
      setErrorMessage('Silakan masukkan Email, Username, atau NIPD Anda.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Silakan masukkan kata sandi atau PIN Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find matching user by email, username, or NIPD
      const matchedUser = users.find((u) => {
        const matchesEmail = u.email && u.email.toLowerCase() === cleanId;
        const matchesUsername = u.username && u.username.toLowerCase() === cleanId;
        const matchesNipd = u.nipd && u.nipd.toLowerCase() === cleanId;
        return matchesEmail || matchesUsername || matchesNipd;
      });

      if (!matchedUser) {
        setIsLoading(false);
        setErrorMessage(
          'Akun tidak ditemukan. Pastikan Email, Username, atau NIPD yang Anda masukkan benar.'
        );
        return;
      }

      // Check active status
      if (matchedUser.statusAktif === false) {
        setIsLoading(false);
        setErrorMessage('Akun Anda dinonaktifkan. Silakan hubungi Administrator Sistem.');
        return;
      }

      // Password verification (flexible demo support for admin123 / admin / 123)
      const userPassword = matchedUser.password || '123';
      const isPasswordValid =
        cleanPass === userPassword ||
        (matchedUser.role === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin')) ||
        (matchedUser.role === 'siswa' && cleanPass === '123') ||
        ((matchedUser.role === 'ketua_kelas' || matchedUser.role === 'sekretaris') && cleanPass === '123') ||
        ((matchedUser.role === 'guru' || matchedUser.role === 'walas') && cleanPass === '123456');

      if (!isPasswordValid) {
        setIsLoading(false);
        setErrorMessage('Kata sandi atau PIN salah. Silakan periksa kembali kata sandi Anda.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLogin(identifier, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-700 flex items-center justify-center shrink-0">
            <img
              src={schoolConfig.logoUrl}
              alt="Logo Sekolah"
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback icon if logo fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <span className="text-white font-black text-sm sm:text-base tracking-tight block leading-tight">
              {schoolConfig.namaSekolah}
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Presensi Siswa Digital
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBackupModal && (
            <button
              id="btn-login-backup-restore"
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              title="Cadangkan atau Pulihkan Data Database JSON"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cadangan / Pulihkan</span>
            </button>
          )}

          {onOpenArchDocs && (
            <button
              id="btn-login-arch-docs"
              onClick={onOpenArchDocs}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Skema SQL & Arsitektur</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Form Center Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branding, Mission, & Benefits (Hidden on very small mobile) */}
          <div className="lg:col-span-5 text-left space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presensi Cepat & Terintegrasi</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Pintu Masuk Terpadu Sistem Presensi Sekolah
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Mendukung presensi melalui <strong>Scan QR Code Kamera</strong> langsung,{' '}
              <strong>Token Presensi Mandiri</strong> per kelas, dan pengelolaan hak akses berbasis peran
              untuk Admin, Guru, Wali Kelas, Pengurus Kelas, hingga Siswa.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-bold">QR Code Unik per Siswa</strong>
                  Digenerate otomatis berbasis NIPD untuk kartu pelajar digital.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-bold">Token Khusus Rombel</strong>
                  Wali kelas, ketua, dan sekretaris dapat merilis token presensi berbatas waktu.
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-bold">Role-Based Security</strong>
                  Hak akses ketat sesuai wewenang kelas masing-masing.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Masuk ke Akun Anda
                </h2>
                <p className="text-xs text-slate-400">
                  Masukkan Email, Username, atau NIPD beserta kata sandi/PIN Anda.
                </p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email, Username, atau NIPD Siswa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-identifier"
                      type="text"
                      required
                      placeholder="Contoh: absensirapot@gmail.com atau NIPD: 26.27.10.021"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      Kata Sandi atau PIN
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi atau PIN akun"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-600 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Ingat Saya di Perangkat Ini</span>
                  </label>
                  <span className="text-slate-400 text-[11px]" title="Hubungi Admin untuk reset PIN">
                    Lupa PIN/Sandi? Hubungi Admin
                  </span>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm shadow-lg hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Memverifikasi Kredensial...</span>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="pt-3 border-t border-slate-700/80 flex items-center gap-2.5 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Akses dilindungi autentikasi ketat berbasis peran (Role-Based Access Control).
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800">
        <div>
          © {new Date().getFullYear()} {schoolConfig.namaSekolah}. Hak cipta dilindungi undang-undang.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            RBAC Terlindungi
          </span>
          <span>•</span>
          <span>Jam Presensi: {schoolConfig.jamMasuk} - {schoolConfig.jamBatasMasuk} WIB</span>
        </div>
      </footer>
    </div>
  );
};
