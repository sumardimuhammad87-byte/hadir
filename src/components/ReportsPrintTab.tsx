import React, { useState } from 'react';
import { Student, Rombel, AttendanceRecord, SchoolConfig, UserAccount } from '../types';
import { calculateAttendanceRate } from '../utils/storage';
import { Printer, Download, Filter, Calendar, FileText, CheckCircle2, AlertTriangle, Building2, User } from 'lucide-react';

interface ReportsPrintTabProps {
  currentUser: UserAccount;
  students: Student[];
  rombels: Rombel[];
  attendanceRecords: AttendanceRecord[];
  schoolConfig: SchoolConfig;
}

export const ReportsPrintTab: React.FC<ReportsPrintTabProps> = ({
  currentUser,
  students,
  rombels,
  attendanceRecords,
  schoolConfig,
}) => {
  // Filters requested by user:
  // 1. Rentang Tanggal (Hari Ini, 7 Hari Terakhir, Bulan Ini, Semester Ini, atau Kustom)
  // 2. Cetak Semua vs Per Kelas
  // 3. Filter status: "Semua Siswa" vs "Hanya Yang Tidak Hadir (Sakit/Izin/Alfa)"
  const [periodPreset, setPeriodPreset] = useState<'today' | 'month' | 'semester' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [selectedRombel, setSelectedRombel] = useState<string>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'UNATTENDED_ONLY'>('ALL');

  // Compute effective date range
  const todayStr = new Date().toISOString().slice(0, 10);
  let startDate = todayStr;
  let endDate = todayStr;

  if (periodPreset === 'month') {
    const d = new Date();
    startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    endDate = todayStr;
  } else if (periodPreset === 'semester') {
    // Current semester start approx
    const d = new Date();
    startDate = `${d.getFullYear()}-07-01`;
    endDate = todayStr;
  } else if (periodPreset === 'custom') {
    startDate = customStartDate;
    endDate = customEndDate;
  }

  // Filter records within date range
  const recordsInRange = attendanceRecords.filter((r) => r.tanggal >= startDate && r.tanggal <= endDate);

  // Group attendance by student NIPD
  interface StudentSummary {
    student: Student;
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
    percentage: number;
  }

  // Determine total effective days for formula
  // User prompt: (Jumlah Hadir / Total Hari Efektif) x 100%
  // In daily view, total days is 1. In month/semester, calculate distinct active dates or schoolConfig.totalHariEfektifSemester.
  const uniqueDates = Array.from(new Set(recordsInRange.map((r) => r.tanggal)));
  const totalDaysInRange = periodPreset === 'semester'
    ? schoolConfig.totalHariEfektifSemester
    : Math.max(1, uniqueDates.length);

  // Filter student base
  const eligibleStudents = students.filter((s) => {
    if (selectedRombel !== 'ALL' && s.rombelId !== selectedRombel) return false;
    return true;
  });

  const studentSummaries: StudentSummary[] = eligibleStudents.map((std) => {
    const studentRecords = recordsInRange.filter((r) => r.nipd === std.nipd);
    let h = 0;
    let s = 0;
    let i = 0;
    let a = 0;

    studentRecords.forEach((r) => {
      if (r.status === 'hadir') h++;
      else if (r.status === 'sakit') s++;
      else if (r.status === 'izin') i++;
      else if (r.status === 'alfa') a++;
    });

    const percentage = calculateAttendanceRate(h, totalDaysInRange);

    return {
      student: std,
      hadir: h,
      sakit: s,
      izin: i,
      alfa: a,
      percentage,
    };
  });

  // Apply Filter: "Hanya Yang Tidak Hadir (Sakit/Izin/Alfa)"
  const filteredSummaries = studentSummaries.filter((item) => {
    if (attendanceFilter === 'UNATTENDED_ONLY') {
      // Siswa yang memiliki catatan Sakit > 0 ATAU Izin > 0 ATAU Alfa > 0 ATAU belum hadir
      return item.sakit > 0 || item.izin > 0 || item.alfa > 0 || item.hadir === 0;
    }
    return true;
  });

  const getRombelName = (id: string) => rombels.find((r) => r.id === id)?.nama || id;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'No',
      'NIPD',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Hadir (H)',
      'Sakit (S)',
      'Izin (I)',
      'Alfa (A)',
      'Total Hari Efektif',
      'Persentase Kehadiran (%)',
    ];

    const rows = filteredSummaries.map((item, idx) => [
      idx + 1,
      `"${item.student.nipd}"`,
      `"${item.student.nisn}"`,
      `"${item.student.nama}"`,
      `"${getRombelName(item.student.rombelId)}"`,
      item.hadir,
      item.sakit,
      item.izin,
      item.alfa,
      totalDaysInRange,
      `"${item.percentage}%"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Absensi_${selectedRombel}_${startDate}_sd_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden on Print) */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Rekapitulasi & Cetak Laporan Presensi Siswa</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rumus otomatis: (Jumlah Hadir / Total Hari Efektif: {totalDaysInRange}) x 100%. Dilengkapi filter Cetak Semua, Per Kelas, dan Yang Tidak Hadir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-reports-excel"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel / CSV
            </button>
            <button
              id="btn-print-reports"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Cetak PDF / Print Rapi
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Preset Periode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rentang Waktu</label>
            <select
              id="select-report-period"
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as 'today' | 'month' | 'semester' | 'custom')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="today">Hari Ini ({todayStr})</option>
              <option value="month">Bulan Ini (Berjalan)</option>
              <option value="semester">Semester Ini ({schoolConfig.totalHariEfektifSemester} Hari)</option>
              <option value="custom">Kustom Tanggal</option>
            </select>
          </div>

          {/* Filter Per Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Rombel (Kelas)</label>
            <select
              id="select-report-rombel"
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Cetak Semua Kelas ({students.length} Siswa)</option>
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Cetak: Semua vs Yang Tidak Hadir Saja */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kriteria Siswa</label>
            <select
              id="select-report-attendance-filter"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as 'ALL' | 'UNATTENDED_ONLY')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Cetak Semua Siswa</option>
              <option value="UNATTENDED_ONLY">Hanya Yang Tidak Hadir (Sakit / Izin / Alfa)</option>
            </select>
          </div>

          {/* Custom Date Pickers if active */}
          {periodPreset === 'custom' && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Mulai</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Selesai</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-medium"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet (Standard Kop Surat Resmi & Ready to Print) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-5 justify-center text-center">
            {schoolConfig.logoUrl && (
              <img
                src={schoolConfig.logoUrl}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain rounded-md shrink-0"
              />
            )}
            <div>
              <p className="text-xs tracking-widest font-semibold uppercase text-slate-600">
                PEMERINTAH DAERAH PROVINSI {schoolConfig.provinsi.toUpperCase()}
              </p>
              <p className="text-xs tracking-wider font-semibold uppercase text-slate-700">
                DINAS PENDIDIKAN CABANG DINAS WILAYAH
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase font-serif">
                {schoolConfig.namaSekolah}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                {schoolConfig.alamatSekolah}, Kel. {schoolConfig.kelurahan}, Kec. {schoolConfig.kecamatan}, {schoolConfig.kotaKab}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Telp: {schoolConfig.telepon} • Email: {schoolConfig.email} • Website: {schoolConfig.website}
              </p>
            </div>
          </div>
        </div>

        {/* Document Title & Meta */}
        <div className="text-center my-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase underline tracking-wide">
            LAPORAN REKAPITULASI PRESENSI SISWA
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 mt-1.5 font-medium">
            <span>
              <strong>Kelas:</strong> {selectedRombel === 'ALL' ? 'Semua Kelas (Semua Rombel)' : getRombelName(selectedRombel)}
            </span>
            <span>•</span>
            <span>
              <strong>Periode:</strong> {startDate} s.d. {endDate}
            </span>
            <span>•</span>
            <span>
              <strong>Hari Efektif:</strong> {totalDaysInRange} Hari
            </span>
            {attendanceFilter === 'UNATTENDED_ONLY' && (
              <>
                <span>•</span>
                <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                  Filter: Siswa Tidak Hadir Saja
                </span>
              </>
            )}
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-800 uppercase text-center">
                <th className="py-2.5 px-2 border border-slate-300 w-10">No</th>
                <th className="py-2.5 px-3 border border-slate-300 text-left">NIPD</th>
                <th className="py-2.5 px-3 border border-slate-300 text-left">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-2 border border-slate-300 text-left">Kelas</th>
                <th className="py-2.5 px-2 border border-slate-300 w-12 bg-emerald-50 text-emerald-900">Hadir</th>
                <th className="py-2.5 px-2 border border-slate-300 w-12 bg-amber-50 text-amber-900">Sakit</th>
                <th className="py-2.5 px-2 border border-slate-300 w-12 bg-sky-50 text-sky-900">Izin</th>
                <th className="py-2.5 px-2 border border-slate-300 w-12 bg-rose-50 text-rose-900">Alfa</th>
                <th className="py-2.5 px-3 border border-slate-300 w-24 bg-slate-200 font-extrabold text-slate-900">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-slate-400">
                    Tidak ada data presensi yang sesuai kriteria laporan ini.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, idx) => (
                  <tr key={item.student.nipd} className="hover:bg-slate-50">
                    <td className="py-2 px-2 text-center border border-slate-300 text-slate-600 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-mono font-semibold text-slate-800">
                      {item.student.nipd}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                      {item.student.nama}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-slate-700">
                      {getRombelName(item.student.rombelId)}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-bold text-emerald-700 bg-emerald-50/40">
                      {item.hadir}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-semibold text-amber-700 bg-amber-50/40">
                      {item.sakit}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-semibold text-sky-700 bg-sky-50/40">
                      {item.izin}
                    </td>
                    <td className="py-2 px-2 border border-slate-300 text-center font-semibold text-rose-700 bg-rose-50/40">
                      {item.alfa}
                    </td>
                    <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-slate-900 bg-slate-100">
                      {item.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Formal Signature Section */}
        <div className="mt-10 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-800 break-inside-avoid">
          <div>
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-bold">Kepala {schoolConfig.namaSekolah}</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{schoolConfig.namaKepalaSekolah}</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP: {schoolConfig.nipKepalaSekolah}</p>
          </div>

          <div className="text-right">
            <p className="text-slate-500">
              {schoolConfig.kotaKab}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-bold">Petugas / Wali Kelas</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{currentUser.nama}</p>
            <p className="text-[11px] text-slate-500 font-mono">Jabatan: {currentUser.jabatan || currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
