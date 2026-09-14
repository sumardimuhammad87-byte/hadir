import { SchoolConfig } from '../types';

export interface HolidayItem {
  tanggal: string; // YYYY-MM-DD
  nama: string;
  tipe: 'nasional' | 'cuti_bersama' | 'mingguan' | 'khusus_sekolah';
  keterangan?: string;
}

// Daftar Resmi Hari Libur Nasional & Cuti Bersama Indonesia (2024 - 2026)
export const INDONESIAN_NATIONAL_HOLIDAYS: Record<string, { nama: string; tipe: 'nasional' | 'cuti_bersama'; keterangan?: string }> = {
  // === TAHUN 2024 ===
  '2024-01-01': { nama: 'Tahun Baru 2024 Masehi', tipe: 'nasional' },
  '2024-02-08': { nama: "Isra Mi'raj Nabi Muhammad SAW", tipe: 'nasional' },
  '2024-02-09': { nama: 'Cuti Bersama Tahun Baru Imlek 2575 Kongzili', tipe: 'cuti_bersama' },
  '2024-02-10': { nama: 'Tahun Baru Imlek 2575 Kongzili', tipe: 'nasional' },
  '2024-03-11': { nama: 'Hari Suci Nyepi Tahun Baru Saka 1946', tipe: 'nasional' },
  '2024-03-12': { nama: 'Cuti Bersama Hari Suci Nyepi', tipe: 'cuti_bersama' },
  '2024-03-29': { nama: 'Wafat Yesus Kristus', tipe: 'nasional' },
  '2024-03-31': { nama: 'Hari Paskah', tipe: 'nasional' },
  '2024-04-08': { nama: 'Cuti Bersama Idul Fitri 1445 Hijriah', tipe: 'cuti_bersama' },
  '2024-04-09': { nama: 'Cuti Bersama Idul Fitri 1445 Hijriah', tipe: 'cuti_bersama' },
  '2024-04-10': { nama: 'Hari Raya Idul Fitri 1445 Hijriah', tipe: 'nasional' },
  '2024-04-11': { nama: 'Hari Raya Idul Fitri 1445 Hijriah', tipe: 'nasional' },
  '2024-04-12': { nama: 'Cuti Bersama Idul Fitri 1445 Hijriah', tipe: 'cuti_bersama' },
  '2024-04-15': { nama: 'Cuti Bersama Idul Fitri 1445 Hijriah', tipe: 'cuti_bersama' },
  '2024-05-01': { nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  '2024-05-09': { nama: 'Kenaikan Yesus Kristus', tipe: 'nasional' },
  '2024-05-10': { nama: 'Cuti Bersama Kenaikan Yesus Kristus', tipe: 'cuti_bersama' },
  '2024-05-23': { nama: 'Hari Raya Waisak 2568 BE', tipe: 'nasional' },
  '2024-05-24': { nama: 'Cuti Bersama Hari Raya Waisak', tipe: 'cuti_bersama' },
  '2024-06-01': { nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  '2024-06-17': { nama: 'Hari Raya Idul Adha 1445 Hijriah', tipe: 'nasional' },
  '2024-06-18': { nama: 'Cuti Bersama Hari Raya Idul Adha', tipe: 'cuti_bersama' },
  '2024-07-07': { nama: 'Tahun Baru Islam 1446 Hijriah', tipe: 'nasional' },
  '2024-08-17': { nama: 'Hari Kemerdekaan Republik Indonesia Ke-79', tipe: 'nasional' },
  '2024-09-16': { nama: 'Maulid Nabi Muhammad SAW', tipe: 'nasional' },
  '2024-12-25': { nama: 'Hari Raya Natal', tipe: 'nasional' },
  '2024-12-26': { nama: 'Cuti Bersama Hari Raya Natal', tipe: 'cuti_bersama' },

  // === TAHUN 2025 ===
  '2025-01-01': { nama: 'Tahun Baru 2025 Masehi', tipe: 'nasional' },
  '2025-01-27': { nama: "Isra Mi'raj Nabi Muhammad SAW", tipe: 'nasional' },
  '2025-01-28': { nama: 'Cuti Bersama Tahun Baru Imlek 2576 Kongzili', tipe: 'cuti_bersama' },
  '2025-01-29': { nama: 'Tahun Baru Imlek 2576 Kongzili', tipe: 'nasional' },
  '2025-03-28': { nama: 'Cuti Bersama Hari Suci Nyepi', tipe: 'cuti_bersama' },
  '2025-03-29': { nama: 'Hari Suci Nyepi Tahun Baru Saka 1947', tipe: 'nasional' },
  '2025-03-31': { nama: 'Hari Raya Idul Fitri 1446 Hijriah', tipe: 'nasional' },
  '2025-04-01': { nama: 'Hari Raya Idul Fitri 1446 Hijriah', tipe: 'nasional' },
  '2025-04-02': { nama: 'Cuti Bersama Hari Raya Idul Fitri 1446 H', tipe: 'cuti_bersama' },
  '2025-04-03': { nama: 'Cuti Bersama Hari Raya Idul Fitri 1446 H', tipe: 'cuti_bersama' },
  '2025-04-04': { nama: 'Cuti Bersama Hari Raya Idul Fitri 1446 H', tipe: 'cuti_bersama' },
  '2025-04-07': { nama: 'Cuti Bersama Hari Raya Idul Fitri 1446 H', tipe: 'cuti_bersama' },
  '2025-04-18': { nama: 'Wafat Yesus Kristus', tipe: 'nasional' },
  '2025-04-20': { nama: 'Hari Kebangkitan Yesus Kristus (Paskah)', tipe: 'nasional' },
  '2025-05-01': { nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  '2025-05-12': { nama: 'Hari Raya Waisak 2569 BE', tipe: 'nasional' },
  '2025-05-13': { nama: 'Cuti Bersama Hari Raya Waisak', tipe: 'cuti_bersama' },
  '2025-05-29': { nama: 'Kenaikan Yesus Kristus', tipe: 'nasional' },
  '2025-05-30': { nama: 'Cuti Bersama Kenaikan Yesus Kristus', tipe: 'cuti_bersama' },
  '2025-06-01': { nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  '2025-06-06': { nama: 'Hari Raya Idul Adha 1446 Hijriah', tipe: 'nasional' },
  '2025-06-09': { nama: 'Cuti Bersama Hari Raya Idul Adha', tipe: 'cuti_bersama' },
  '2025-06-27': { nama: 'Tahun Baru Islam 1447 Hijriah', tipe: 'nasional' },
  '2025-08-17': { nama: 'Hari Kemerdekaan Republik Indonesia Ke-80', tipe: 'nasional' },
  '2025-09-05': { nama: 'Maulid Nabi Muhammad SAW', tipe: 'nasional' },
  '2025-12-25': { nama: 'Hari Raya Natal', tipe: 'nasional' },
  '2025-12-26': { nama: 'Cuti Bersama Hari Raya Natal', tipe: 'cuti_bersama' },

  // === TAHUN 2026 ===
  '2026-01-01': { nama: 'Tahun Baru 2026 Masehi', tipe: 'nasional' },
  '2026-01-16': { nama: "Isra Mi'raj Nabi Muhammad SAW", tipe: 'nasional' },
  '2026-02-17': { nama: 'Tahun Baru Imlek 2577 Kongzili', tipe: 'nasional' },
  '2026-03-20': { nama: 'Hari Raya Idul Fitri 1447 Hijriah', tipe: 'nasional' },
  '2026-03-21': { nama: 'Hari Raya Idul Fitri 1447 Hijriah', tipe: 'nasional' },
  '2026-03-22': { nama: 'Cuti Bersama Hari Raya Idul Fitri', tipe: 'cuti_bersama' },
  '2026-03-23': { nama: 'Cuti Bersama Hari Raya Idul Fitri', tipe: 'cuti_bersama' },
  '2026-03-24': { nama: 'Cuti Bersama Hari Raya Idul Fitri', tipe: 'cuti_bersama' },
  '2026-03-25': { nama: 'Hari Suci Nyepi Tahun Baru Saka 1948', tipe: 'nasional' },
  '2026-04-03': { nama: 'Wafat Yesus Kristus (Jumat Agung)', tipe: 'nasional' },
  '2026-04-05': { nama: 'Hari Paskah', tipe: 'nasional' },
  '2026-05-01': { nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  '2026-05-14': { nama: 'Kenaikan Yesus Kristus', tipe: 'nasional' },
  '2026-05-27': { nama: 'Hari Raya Idul Adha 1447 Hijriah', tipe: 'nasional' },
  '2026-05-31': { nama: 'Hari Raya Waisak 2570 BE', tipe: 'nasional' },
  '2026-06-01': { nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  '2026-06-16': { nama: 'Tahun Baru Islam 1448 Hijriah', tipe: 'nasional' },
  '2026-08-17': { nama: 'Hari Kemerdekaan Republik Indonesia Ke-81', tipe: 'nasional' },
  '2026-08-25': { nama: 'Maulid Nabi Muhammad SAW', tipe: 'nasional' },
  '2026-12-25': { nama: 'Hari Raya Natal', tipe: 'nasional' },
  '2026-12-26': { nama: 'Cuti Bersama Hari Raya Natal', tipe: 'cuti_bersama' },
};

// Check if a specific date (YYYY-MM-DD) is a public holiday or weekend
export function getHolidayInfo(
  dateStr: string,
  schoolConfig?: SchoolConfig
): {
  isHoliday: boolean;
  holidayName?: string;
  type?: 'nasional' | 'cuti_bersama' | 'mingguan' | 'khusus_sekolah';
  isSunday?: boolean;
  isSaturday?: boolean;
  description?: string;
} {
  if (!dateStr || dateStr.length < 10) {
    return { isHoliday: false };
  }

  // Parse day of week
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu

  // 1. Cek Hari Libur Khusus Sekolah (dari SchoolConfig)
  const customHolidays = (schoolConfig as any)?.hariLiburKhusus;
  if (Array.isArray(customHolidays)) {
    const customMatch = customHolidays.find((h: any) => h.tanggal === dateStr);
    if (customMatch) {
      return {
        isHoliday: true,
        holidayName: customMatch.nama || 'Libur Khusus Sekolah',
        type: 'khusus_sekolah',
        description: customMatch.keterangan || 'Libur khusus yang ditetapkan pihak sekolah.',
      };
    }
  }

  // 2. Cek Hari Libur Nasional & Cuti Bersama
  const nationalHoliday = INDONESIAN_NATIONAL_HOLIDAYS[dateStr];
  if (nationalHoliday) {
    return {
      isHoliday: true,
      holidayName: nationalHoliday.nama,
      type: nationalHoliday.tipe,
      description: nationalHoliday.tipe === 'cuti_bersama' ? 'Cuti Bersama Resmi Pemerintah' : 'Hari Libur Nasional Resmi (Tanggal Merah)',
    };
  }

  // 3. Cek Hari Minggu (Selalu Tanggal Merah)
  if (dayOfWeek === 0) {
    return {
      isHoliday: true,
      holidayName: 'Hari Minggu (Libur Akhir Pekan)',
      type: 'mingguan',
      isSunday: true,
      description: 'Hari libur rutin akhir pekan.',
    };
  }

  // 4. Cek Hari Sabtu (Jika sekolah menerapkan 5 hari sekolah per minggu)
  const daysPerWeek = (schoolConfig as any)?.hariSekolahPerminggu || 5;
  if (dayOfWeek === 6 && daysPerWeek === 5) {
    return {
      isHoliday: true,
      holidayName: 'Hari Sabtu (Libur 5 Hari Sekolah)',
      type: 'mingguan',
      isSaturday: true,
      description: 'Libur akhir pekan (sistem 5 hari sekolah).',
    };
  }

  return { isHoliday: false };
}

// Simple Boolean checker
export function isDateHoliday(dateStr: string, schoolConfig?: SchoolConfig): boolean {
  return getHolidayInfo(dateStr, schoolConfig).isHoliday;
}

// Indonesian Day Names
const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Format: "Senin, 13 Oktober 2025"
export function formatIndonesianDateWithDay(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = INDONESIAN_DAYS[dateObj.getDay()];
  const monthName = INDONESIAN_MONTHS[m - 1];
  return `${dayName}, ${d} ${monthName} ${y}`;
}

// Calculate effective school days between two dates (excluding holidays and weekends)
export function calculateEffectiveDaysInRange(
  startDate: string,
  endDate: string,
  schoolConfig?: SchoolConfig
): { totalEffectiveDays: number; holidaysCount: number; dates: string[] } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return { totalEffectiveDays: 1, holidaysCount: 0, dates: [startDate] };
  }

  let effective = 0;
  let holidays = 0;
  const dates: string[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    dates.push(dStr);

    const info = getHolidayInfo(dStr, schoolConfig);
    if (info.isHoliday) {
      holidays++;
    } else {
      effective++;
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    totalEffectiveDays: Math.max(1, effective),
    holidaysCount: holidays,
    dates,
  };
}
