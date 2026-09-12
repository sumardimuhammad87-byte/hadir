import React, { useState, useEffect } from 'react';
import { X, Database, Layers, Code, CheckCircle, Copy, Cpu, BookOpen, ExternalLink } from 'lucide-react';

interface ArchitectureDocsModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<ArchitectureDocsModalProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'mysql' | 'logic' | 'libraries'>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sqlSchemaDDL = `-- =========================================================================
-- STRUKTUR DATABASE LENGKAP SISTEM ABSENSI SISWA BERBASIS QR CODE (MySQL 8.0+)
-- NIPD (Nomor Induk Peserta Didik) sebagai PRIMARY KEY & FOREIGN KEY
-- =========================================================================

CREATE DATABASE IF NOT EXISTS db_absensi_siswa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_absensi_siswa;

-- 1. Tabel Profil Sekolah & Konfigurasi Presensi
CREATE TABLE IF NOT EXISTS sekolah (
    id_sekolah INT AUTO_INCREMENT PRIMARY KEY,
    nama_sekolah VARCHAR(150) NOT NULL,
    alamat_sekolah TEXT NOT NULL,
    kelurahan VARCHAR(50),
    kecamatan VARCHAR(50),
    kota_kab VARCHAR(50) NOT NULL,
    provinsi VARCHAR(50) NOT NULL,
    telepon VARCHAR(25),
    email VARCHAR(100),
    website VARCHAR(100),
    nama_kepala_sekolah VARCHAR(100),
    nip_kepala_sekolah VARCHAR(30),
    logo_url VARCHAR(255),
    jam_masuk TIME NOT NULL DEFAULT '07:00:00',
    jam_batas_masuk TIME NOT NULL DEFAULT '07:30:00',
    total_hari_efektif_semester INT NOT NULL DEFAULT 110,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Rombongan Belajar (Rombel / Kelas)
CREATE TABLE IF NOT EXISTS rombel (
    id_rombel VARCHAR(20) PRIMARY KEY, -- Contoh: 'ROMBEL-X', 'ROMBEL-XI-FAR'
    nama_rombel VARCHAR(100) NOT NULL,
    tingkat ENUM('X', 'XI', 'XII') NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    wali_kelas_nama VARCHAR(100),
    wali_kelas_nip VARCHAR(30),
    ketua_kelas_nipd VARCHAR(30),
    sekretaris_nipd VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Data Pokok Siswa (NIPD sebagai PRIMARY KEY)
CREATE TABLE IF NOT EXISTS siswa (
    nipd VARCHAR(30) PRIMARY KEY, -- Contoh: '26.27.10.002' (PRIMARY KEY)
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(150) NOT NULL,
    jk ENUM('L', 'P') NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE NOT NULL,
    id_rombel VARCHAR(20) NOT NULL,
    foto_profil VARCHAR(255),
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_siswa_rombel FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Hubungkan FK Ketua Kelas & Sekretaris Kelas setelah tabel siswa dibuat
ALTER TABLE rombel 
    ADD CONSTRAINT fk_rombel_ketua FOREIGN KEY (ketua_kelas_nipd) REFERENCES siswa(nipd) ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_rombel_sekretaris FOREIGN KEY (sekretaris_nipd) REFERENCES siswa(nipd) ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Tabel Akun Pengguna & Hak Akses (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna VARCHAR(40) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    role ENUM('admin', 'guru', 'staf', 'walas', 'ketua_kelas', 'sekretaris', 'siswa') NOT NULL,
    nipd VARCHAR(30) NULL, -- Khusus siswa / pengurus kelas
    id_rombel VARCHAR(20) NULL, -- Khusus walas / ketua / sekretaris / siswa
    jabatan VARCHAR(100),
    foto VARCHAR(255),
    telepon VARCHAR(25),
    status_aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pengguna_siswa FOREIGN KEY (nipd) REFERENCES siswa(nipd) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pengguna_rombel FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Token Presensi Aktif
CREATE TABLE IF NOT EXISTS token_absensi (
    id_token VARCHAR(40) PRIMARY KEY,
    token_kode VARCHAR(15) NOT NULL, -- Contoh: 'TK-8492'
    id_rombel VARCHAR(20) NOT NULL DEFAULT 'ALL',
    dibuat_oleh_id VARCHAR(40) NOT NULL,
    role_pembuat VARCHAR(30) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_token_pembuat FOREIGN KEY (dibuat_oleh_id) REFERENCES pengguna(id_pengguna) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabel Rekapitulasi Presensi Siswa (NIPD sebagai FOREIGN KEY)
CREATE TABLE IF NOT EXISTS absensi (
    id_absensi BIGINT AUTO_INCREMENT PRIMARY KEY,
    nipd VARCHAR(30) NOT NULL, -- FOREIGN KEY ke siswa(nipd)
    id_rombel VARCHAR(20) NOT NULL,
    tanggal_presensi DATE NOT NULL,
    waktu_masuk TIME NOT NULL,
    status_kehadiran ENUM('hadir', 'sakit', 'izin', 'alfa') NOT NULL,
    metode_presensi ENUM('qr_scan', 'token', 'manual_admin', 'manual_guru', 'manual_pengurus') NOT NULL,
    recorded_by_role VARCHAR(30) NOT NULL,
    recorded_by_name VARCHAR(100) NOT NULL,
    token_used VARCHAR(15) NULL,
    keterangan VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_siswa_tanggal (nipd, tanggal_presensi), -- Mencegah double absensi pada hari yang sama
    CONSTRAINT fk_absensi_siswa FOREIGN KEY (nipd) REFERENCES siswa(nipd) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_absensi_rombel FOREIGN KEY (id_rombel) REFERENCES rombel(id_rombel) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indeks Tambahan untuk Query Laporan Cepat
CREATE INDEX idx_absensi_tanggal_rombel ON absensi(tanggal_presensi, id_rombel);
CREATE INDEX idx_absensi_status ON absensi(status_kehadiran);`;

  const nodeCodeSnippet = `// =========================================================================
// CONTOH KODE LOGIKA BACKEND (Express.js / Node.js + MySQL Controller)
// =========================================================================

import { Request, Response } from 'express';
import db from '../config/database';

// 1. Logika Endpoint: Scan QR Code Siswa oleh Kamera Guru/Admin
export const scanStudentQrAttendance = async (req: Request, res: Response) => {
  const { nipd } = req.body; // NIPD didapat dari hasil decode kamera QR
  const recordedBy = req.user; // Dari JWT middleware auth

  if (!nipd) {
    return res.status(400).json({ success: false, message: 'NIPD siswa tidak valid!' });
  }

  try {
    // a. Cari siswa berdasarkan NIPD
    const [students]: any = await db.query(
      'SELECT s.nipd, s.nama_lengkap, s.id_rombel, r.nama_rombel FROM siswa s JOIN rombel r ON s.id_rombel = r.id_rombel WHERE s.nipd = ? AND s.status_aktif = 1',
      [nipd]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak terdaftar dalam sistem!' });
    }

    const student = students[0];
    const today = new Date().toISOString().slice(0, 10);
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false });

    // b. Insert atau Update (UPSERT) kehadiran hari ini
    await db.query(
      \`INSERT INTO absensi 
        (nipd, id_rombel, tanggal_presensi, waktu_masuk, status_kehadiran, metode_presensi, recorded_by_role, recorded_by_name, keterangan)
       VALUES (?, ?, ?, ?, 'hadir', 'qr_scan', ?, ?, 'Presensi Scan QR Gerbang')
       ON DUPLICATE KEY UPDATE 
        status_kehadiran = 'hadir',
        waktu_masuk = VALUES(waktu_masuk),
        metode_presensi = 'qr_scan',
        recorded_by_role = VALUES(recorded_by_role),
        recorded_by_name = VALUES(recorded_by_name)\`,
      [student.nipd, student.id_rombel, today, timeNow, recordedBy.role, recordedBy.nama]
    );

    return res.json({
      success: true,
      message: \`Presensi berhasil! \${student.nama_lengkap} tercatat HADIR pukul \${timeNow}\`,
      student,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Logika Endpoint: Absen Mandiri Siswa Menggunakan Token
export const checkInWithToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const studentUser = req.user; // role = 'siswa', memiliki studentUser.nipd

  try {
    // a. Cari token aktif yang belum kedaluwarsa
    const [tokens]: any = await db.query(
      'SELECT * FROM token_absensi WHERE token_kode = ? AND is_active = 1 AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Kode token tidak valid atau telah kedaluwarsa!' });
    }

    const activeToken = tokens[0];

    // b. Validasi target rombel token (jika bukan 'ALL', harus cocok dengan rombel siswa)
    if (activeToken.id_rombel !== 'ALL' && activeToken.id_rombel !== studentUser.id_rombel) {
      return res.status(403).json({ success: false, message: 'Token ini bukan untuk kelas Anda!' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false });

    // c. Catat kehadiran
    await db.query(
      \`INSERT INTO absensi 
        (nipd, id_rombel, tanggal_presensi, waktu_masuk, status_kehadiran, metode_presensi, recorded_by_role, recorded_by_name, token_used, keterangan)
       VALUES (?, ?, ?, ?, 'hadir', 'token', 'siswa', ?, ?, 'Absen mandiri via token')
       ON DUPLICATE KEY UPDATE 
        status_kehadiran = 'hadir',
        waktu_masuk = VALUES(waktu_masuk),
        metode_presensi = 'token',
        token_used = VALUES(token_used)\`,
      [studentUser.nipd, studentUser.id_rombel, today, timeNow, studentUser.nama, activeToken.token_kode]
    );

    return res.json({ success: true, message: 'Presensi via token berhasil! Status: HADIR' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Logika Kalkulasi Persentase Kehadiran & Rekap Laporan
export const calculateStudentAttendanceRate = async (req: Request, res: Response) => {
  const { id_rombel, start_date, end_date } = req.query;

  // Rumus spesifik: (Jumlah Hadir / Total Hari Efektif) * 100%
  const [results]: any = await db.query(
    \`SELECT 
        s.nipd,
        s.nisn,
        s.nama_lengkap,
        r.nama_rombel,
        COUNT(CASE WHEN a.status_kehadiran = 'hadir' THEN 1 END) AS total_hadir,
        COUNT(CASE WHEN a.status_kehadiran = 'sakit' THEN 1 END) AS total_sakit,
        COUNT(CASE WHEN a.status_kehadiran = 'izin' THEN 1 END) AS total_izin,
        COUNT(CASE WHEN a.status_kehadiran = 'alfa' THEN 1 END) AS total_alfa,
        sek.total_hari_efektif_semester AS total_hari_efektif,
        ROUND((COUNT(CASE WHEN a.status_kehadiran = 'hadir' THEN 1 END) / sek.total_hari_efektif_semester) * 100, 1) AS persentase_kehadiran
      FROM siswa s
      JOIN rombel r ON s.id_rombel = r.id_rombel
      CROSS JOIN sekolah sek
      LEFT JOIN absensi a ON s.nipd = a.nipd AND a.tanggal_presensi BETWEEN ? AND ?
      WHERE (? = 'ALL' OR s.id_rombel = ?)
      GROUP BY s.nipd, s.nisn, s.nama_lengkap, r.nama_rombel, sek.total_hari_efektif_semester
      ORDER BY s.nama_lengkap ASC\`,
    [start_date, end_date, id_rombel, id_rombel]
  );

  return res.json({ success: true, data: results });
};`;

  return (
    <div
      id="modal-arch-docs-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="modal-arch-docs-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Arsitektur Sistem, Rancangan Database & Alur Logika
              </h3>
              <p className="text-xs text-slate-400">
                Spesifikasi Teknis Lengkap, Skema MySQL Relasional (NIPD PK/FK), & Rekomendasi Library
              </p>
            </div>
          </div>
          <button
            id="btn-close-arch-docs-header"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Arsitektur Sistem
          </button>
          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'mysql'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Skema Database MySQL (DDL)
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'logic'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            Contoh Logika Kode (Backend)
          </button>
          <button
            onClick={() => setActiveTab('libraries')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
              activeTab === 'libraries'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Rekomendasi Pustaka (Library)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h4 className="font-bold text-sm text-emerald-950 mb-2">Gambaran Arsitektur Sistem 3-Tier</h4>
                <p className="text-slate-700 leading-relaxed">
                  Aplikasi Absensi Siswa ini dirancang dengan pendekatan <strong>Role-Based Access Control (RBAC)</strong> yang memisahkan otoritas antara Superuser (Admin), Tenaga Pendidik (Guru & Staf), Wali Kelas (Walas), Pengurus Kelas (Ketua & Sekretaris), dan Peserta Didik (Siswa).
                </p>
              </div>

              {/* Architecture Diagram Box */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
                <div className="text-emerald-400 font-bold">[Presentation Tier - Web / Mobile Responsive]</div>
                <div className="pl-4 border-l-2 border-emerald-500/50 space-y-1 text-slate-300">
                  <p>• Kamera Scanner Live: HTML5 getUserMedia + html5-qrcode</p>
                  <p>• Portal Siswa: Kartu Pelajar Digital (QR NIPD) + Input Token Mandiri + Profil</p>
                  <p>• Dashboard Admin & Guru: Tab Absensi Terpisah Per Kelas + Rekap Cetak PDF/Excel</p>
                  <p>• Portal Pengurus Kelas: Otoritas Absen & Buat Token Terkunci ke Rombel Sendiri</p>
                </div>

                <div className="text-sky-400 font-bold pt-2">[Application & Logic Tier - Express.js / Laravel API]</div>
                <div className="pl-4 border-l-2 border-sky-500/50 space-y-1 text-slate-300">
                  <p>• RBAC Middleware: Verifikasi token JWT & validasi batasan role</p>
                  <p>• Token Engine: Generator token 6-digit dengan countdown kedaluwarsa</p>
                  <p>• Percentage Calculation: (Jumlah Hadir / Total Hari Efektif) × 100%</p>
                  <p>• Mass Account Generator: 1-klik provisioning akun siswa dari data master</p>
                </div>

                <div className="text-amber-400 font-bold pt-2">[Data Persistence Tier - Relational MySQL 8.0]</div>
                <div className="pl-4 border-l-2 border-amber-500/50 space-y-1 text-slate-300">
                  <p>• NIPD sebagai Primary Key (tabel siswa) & Foreign Key berelasi (tabel absensi, pengguna, rombel)</p>
                  <p>• Unique Constraint (nipd, tanggal) mencegah duplikasi kehadiran dalam sehari</p>
                </div>
              </div>

              {/* Role Matrix */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">Matriks Hak Akses (Role-Based Access Control)</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                        <th className="p-2.5">Fitur / Hak Akses</th>
                        <th className="p-2.5 text-center">Admin</th>
                        <th className="p-2.5 text-center">Guru/Staf</th>
                        <th className="p-2.5 text-center">Walas</th>
                        <th className="p-2.5 text-center">Ketua/Sekretaris</th>
                        <th className="p-2.5 text-center">Siswa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium">Kelola Master Siswa & Rombel</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Penuh</td>
                        <td className="p-2.5 text-center text-slate-400">Lihat</td>
                        <td className="p-2.5 text-center text-slate-400">Lihat</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Kelola Pengguna & Reset Sandi</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Penuh</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-slate-400">Akun Sendiri</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Scanner QR Code Gerbang</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelasnya</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Absensi Manual (Hadir/Sakit/Izin/Alfa)</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelasnya</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelasnya</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Pembuatan Token Absensi</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Bebas</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Bebas</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelasnya</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelasnya</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Absen Mandiri via Token</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Penuh</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Cetak Laporan PDF / Export Excel</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua Filter</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Semua Filter</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Kelas Binaan</td>
                        <td className="p-2.5 text-center text-rose-500">✗</td>
                        <td className="p-2.5 text-center text-slate-400">Riwayat Sendiri</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MYSQL SCHEMA */}
          {activeTab === 'mysql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Skrip DDL Database MySQL 8.0</h4>
                  <p className="text-slate-500 text-xs">
                    Menggunakan NIPD sebagai PRIMARY KEY di tabel `siswa` dan FOREIGN KEY berelasi di tabel `absensi`, `pengguna`, dan `rombel`.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(sqlSchemaDDL, 'sql')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedCode === 'sql' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'sql' ? 'Tersalin!' : 'Salin Skrip SQL'}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96">
                {sqlSchemaDDL}
              </pre>
            </div>
          )}

          {/* TAB 3: CODE LOGIC */}
          {activeTab === 'logic' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Contoh Logika Kode Backend (Express.js & SQL)</h4>
                  <p className="text-slate-500 text-xs">
                    Meliputi validasi QR scan, verifikasi token siswa, dan kalkulasi persentase dengan rumus `(Hadir / Hari Efektif) × 100%`.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(nodeCodeSnippet, 'code')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedCode === 'code' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'code' ? 'Tersalin!' : 'Salin Kode Node.js'}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-sky-300 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96">
                {nodeCodeSnippet}
              </pre>
            </div>
          )}

          {/* TAB 4: LIBRARIES RECOMMENDATION */}
          {activeTab === 'libraries' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Rekomendasi Pustaka (Library) Terbaik</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Scanner */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    <span>1. QR Code Scanner (Kamera Perangkat)</span>
                  </div>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      <strong>html5-qrcode (Rekomendasi Utama):</strong> Sangat ringan, mendukung kamera laptop maupun smartphone (kamera depan/belakang), auto fallback, dan scanning file gambar QR.
                    </li>
                    <li>
                      <strong>@zxing/library:</strong> Library barcode & QR universal porting dari Google ZXing, performa pemindaian sangat akurat.
                    </li>
                    <li>
                      <strong>Mobile Native (Android/iOS):</strong> Google ML Kit Barcode Scanning API dengan CameraX untuk respon scan milidetik tanpa lag.
                    </li>
                  </ul>
                </div>

                {/* QR Generator */}
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Code className="w-4 h-4 text-indigo-600" />
                    <span>2. QR Code Generator (Otomatis NIPD)</span>
                  </div>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      <strong>qrcode (Node.js & Browser):</strong> Mendukung output Canvas, SVG, DataURL base64, dan PNG file stream.
                    </li>
                    <li>
                      <strong>qrcode.react:</strong> Komponen React deklaratif untuk render langsung di DOM.
                    </li>
                    <li>
                      <strong>endroid/qr-code (PHP / Laravel):</strong> Library standar industri PHP untuk mencetak kartu pelajar otomatis ke PDF.
                    </li>
                  </ul>
                </div>

                {/* PDF & Export */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Database className="w-4 h-4 text-slate-600" />
                    <span>3. Cetak Laporan PDF & Rekap Excel</span>
                  </div>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      <strong>Browser Native Print:</strong> CSS <code>@media print</code> dengan zero-dependency menghasilkan cetakan paling tajam dan presisi mengikuti printer sistem.
                    </li>
                    <li>
                      <strong>jsPDF + jspdf-autotable:</strong> Pembuatan PDF client-side langsung tanpa beban server.
                    </li>
                    <li>
                      <strong>SheetJS (xlsx) / Native CSV:</strong> Export tabel rekap kehadiran ke format yang langsung kompatibel dengan Microsoft Excel & Google Sheets.
                    </li>
                  </ul>
                </div>

                {/* Auth & Security */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>4. Otentikasi & Keamanan Data</span>
                  </div>
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      <strong>bcrypt / argon2:</strong> Enkripsi sandi akun pengguna (Admin, Guru, Siswa).
                    </li>
                    <li>
                      <strong>jsonwebtoken (JWT):</strong> Token bearer stateless untuk mengontrol hak akses endpoint API secara modular.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>Arsitektur sesuai ketentuan NIPD sebagai Primary/Foreign Key & Role-Based Access Control</span>
          <button
            id="btn-close-arch-docs-footer"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-semibold transition cursor-pointer shadow-xs"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
