import { UserAccount, Student } from '../types';

export interface BirthdayInfo {
  isBirthday: boolean;
  age?: number;
  formattedDate: string;
  birthMonth?: number;
  birthDay?: number;
}

/**
 * Returns time of day greeting in Indonesian (Pagi, Siang, Sore, Malam)
 */
export function getTimeGreeting(date = new Date()): {
  greeting: string;
  period: 'pagi' | 'siang' | 'sore' | 'malam';
  icon: string;
  subtext: string;
} {
  const hours = date.getHours();
  if (hours >= 4 && hours < 11) {
    return {
      greeting: 'Selamat Pagi',
      period: 'pagi',
      icon: '🌅',
      subtext: 'Semangat menyambut hari baru dan memulai aktivitas belajar mengajar.',
    };
  } else if (hours >= 11 && hours < 15) {
    return {
      greeting: 'Selamat Siang',
      period: 'siang',
      icon: '☀️',
      subtext: 'Selamat melanjutkan aktivitas dan jangan lupa istirahat yang cukup.',
    };
  } else if (hours >= 15 && hours < 18) {
    return {
      greeting: 'Selamat Sore',
      period: 'sore',
      icon: '🌇',
      subtext: 'Tetap bersemangat menyelesaikan agenda hari ini.',
    };
  } else {
    return {
      greeting: 'Selamat Malam',
      period: 'malam',
      icon: '🌙',
      subtext: 'Selamat beristirahat dan memulihkan energi untuk esok hari.',
    };
  }
}

/**
 * Checks if a given date string matches today's month and day (Birthday check)
 */
export function checkBirthday(birthDateStr?: string, refDate = new Date()): BirthdayInfo {
  if (!birthDateStr || typeof birthDateStr !== 'string') {
    return { isBirthday: false, formattedDate: '' };
  }

  const clean = birthDateStr.trim();
  const refMonth = refDate.getMonth() + 1;
  const refDay = refDate.getDate();
  const refYear = refDate.getFullYear();

  let bYear: number | undefined;
  let bMonth: number | undefined;
  let bDay: number | undefined;

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(clean)) {
    const parts = clean.split('-');
    bYear = parseInt(parts[0], 10);
    bMonth = parseInt(parts[1], 10);
    bDay = parseInt(parts[2], 10);
  }
  // Format: DD-MM-YYYY or DD/MM/YYYY
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(clean)) {
    const parts = clean.split(/[-/]/);
    bDay = parseInt(parts[0], 10);
    bMonth = parseInt(parts[1], 10);
    bYear = parseInt(parts[2], 10);
  }

  if (!bMonth || !bDay) {
    return { isBirthday: false, formattedDate: clean };
  }

  const isBirthday = bMonth === refMonth && bDay === refDay;
  const age = bYear && refYear >= bYear ? refYear - bYear : undefined;

  const monthNames = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const formattedDate = `${bDay} ${monthNames[bMonth] || ''} ${bYear || ''}`.trim();

  return {
    isBirthday,
    age,
    formattedDate,
    birthMonth: bMonth,
    birthDay: bDay,
  };
}

/**
 * Generates personalized Indonesian greeting and birthday message for the user
 */
export function getUserGreetingDetails(
  user: UserAccount,
  student?: Student | null
): {
  timeGreeting: string;
  period: 'pagi' | 'siang' | 'sore' | 'malam';
  icon: string;
  subtext: string;
  isBirthday: boolean;
  age?: number;
  birthDateFormatted: string;
  headlineGreeting: string;
  birthdayWish: string;
} {
  const time = getTimeGreeting();
  const birthDateStr = student?.tanggalLahir;
  const bInfo = checkBirthday(birthDateStr);

  const displayName = user.nama || student?.nama || 'Pengguna';
  const roleLabel =
    user.role === 'admin'
      ? 'Administrator Sistem'
      : user.role === 'guru'
      ? 'Bapak/Ibu Guru'
      : user.role === 'walas'
      ? 'Wali Kelas'
      : user.role === 'ketua_kelas'
      ? 'Ketua Kelas'
      : user.role === 'sekretaris'
      ? 'Sekretaris Kelas'
      : 'Siswa';

  const headlineGreeting = `${time.greeting}, ${displayName}!`;

  const birthdayWish = bInfo.isBirthday
    ? `Selamat Ulang Tahun${bInfo.age ? ` yang ke-${bInfo.age}` : ''}, ${displayName}! Semoga panjang umur, senantiasa diberikan kesehatan, keberkahan, kemudahan dalam menuntut ilmu, dan kesuksesan meraih masa depan yang gemilang bersama keluarga besar SMKN 1 KELAPA KAMPIT.`
    : '';

  return {
    timeGreeting: time.greeting,
    period: time.period,
    icon: time.icon,
    subtext: time.subtext,
    isBirthday: bInfo.isBirthday,
    age: bInfo.age,
    birthDateFormatted: bInfo.formattedDate,
    headlineGreeting,
    birthdayWish,
  };
}
