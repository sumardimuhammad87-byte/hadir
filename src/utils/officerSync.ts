import { Rombel, Student, UserAccount, UserRole } from '../types';

/**
 * Utility untuk sinkronisasi otomatis 1 Akun Terpadu untuk Siswa & Pengurus Kelas (Ketua Kelas / Sekretaris)
 * 
 * Aturan Utama:
 * 1. Setiap siswa hanya memiliki TEPAT 1 AKUN PENGGUNA.
 * 2. Jika siswa ditunjuk menjadi Ketua Kelas atau Sekretaris:
 *    - Akun pengguna miliknya otomatis di-upgrade ke role 'ketua_kelas' atau 'sekretaris'
 *    - Jabatan dan hak akses diperbarui otomatis sesuai rombel pimpinannya
 *    - Jika akun belum ada, otomatis dibuatkan 1 akun dengan username NIPD & password default
 * 3. Jika siswa tidak lagi menjabat sebagai Ketua Kelas atau Sekretaris:
 *    - Akunnya otomatis kembali menjadi role 'siswa' (tidak ada akun ganda atau tertinggal)
 * 4. Menghapus / menggabungkan akun duplikat lama (misal akun khusus ketua_xifar digabung ke akun NIPD siswa)
 */

export function cleanNipdString(nipd: string): string {
  return nipd ? nipd.replace(/[^a-zA-Z0-9]/g, '') : '';
}

export function syncRombelOfficersWithUserAccounts(
  rombels: Rombel[],
  students: Student[],
  existingUsers: UserAccount[]
): {
  updatedUsers: UserAccount[];
  changesCount: number;
} {
  let changesCount = 0;

  // Map siswa berdasarkan NIPD
  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.nipd, s));

  // Map penugasan pengurus kelas: nipd -> { role, rombelId, rombelNama }
  const officerAssignmentMap = new Map<
    string,
    { role: 'ketua_kelas' | 'sekretaris'; rombelId: string; rombelNama: string }
  >();

  rombels.forEach((rombel) => {
    if (rombel.ketuaKelasNipd && studentMap.has(rombel.ketuaKelasNipd)) {
      officerAssignmentMap.set(rombel.ketuaKelasNipd, {
        role: 'ketua_kelas',
        rombelId: rombel.id,
        rombelNama: rombel.nama,
      });
    }

    if (rombel.sekretarisNipd && studentMap.has(rombel.sekretarisNipd)) {
      officerAssignmentMap.set(rombel.sekretarisNipd, {
        role: 'sekretaris',
        rombelId: rombel.id,
        rombelNama: rombel.nama,
      });
    }
  });

  // 1. Identifikasi dan deduplikasi akun siswa
  // Cari apakah ada akun terpisah untuk ketua_xifar atau sek_xifar yang mengarah ke siswa yang sama
  const consolidatedUsers: UserAccount[] = [];
  const processedNipds = new Set<string>();

  existingUsers.forEach((user) => {
    // Jika user non-siswa dan non-pengurus (admin, guru, staf, walas tanpa NIPD siswa), pertahankan
    if (!user.nipd && user.role !== 'ketua_kelas' && user.role !== 'sekretaris' && user.role !== 'siswa') {
      consolidatedUsers.push(user);
      return;
    }

    // Jika user memiliki NIPD atau username cocok dengan NIPD siswa
    let linkedNipd = user.nipd;
    if (!linkedNipd) {
      // Coba cocokkan username dengan NIPD siswa
      const match = students.find((s) => s.nipd === user.username);
      if (match) linkedNipd = match.nipd;
    }

    // Jika ini adalah akun siswa / pengurus
    if (linkedNipd) {
      if (processedNipds.has(linkedNipd)) {
        // Akun duplikat untuk NIPD yang sama! Lewati agar hanya tersisa 1 akun terpadu
        changesCount++;
        return;
      }
      processedNipds.add(linkedNipd);

      const student = studentMap.get(linkedNipd);
      const officer = officerAssignmentMap.get(linkedNipd);

      const targetRole: UserRole = officer ? officer.role : 'siswa';
      const targetJabatan = officer
        ? `${officer.role === 'ketua_kelas' ? 'Ketua Kelas' : 'Sekretaris'} ${officer.rombelNama}`
        : `Siswa ${student ? (rombels.find((r) => r.id === student.rombelId)?.nama || '') : ''}`.trim();
      const targetRombelId = officer ? officer.rombelId : (student ? student.rombelId : user.rombelId);

      const isUpdated =
        user.role !== targetRole ||
        user.jabatan !== targetJabatan ||
        user.rombelId !== targetRombelId ||
        user.nipd !== linkedNipd;

      if (isUpdated) {
        changesCount++;
        consolidatedUsers.push({
          ...user,
          role: targetRole,
          jabatan: targetJabatan,
          rombelId: targetRombelId,
          nipd: linkedNipd,
          nama: student ? student.nama : user.nama,
          statusAktif: true,
        });
      } else {
        consolidatedUsers.push(user);
      }
    } else {
      consolidatedUsers.push(user);
    }
  });

  // 2. Cek apakah ada pengurus kelas yang BELUM punya akun pengguna sama sekali
  officerAssignmentMap.forEach((officer, nipd) => {
    if (!processedNipds.has(nipd)) {
      const student = studentMap.get(nipd);
      if (student) {
        const cleanNipd = cleanNipdString(student.nipd);
        const newAccount: UserAccount = {
          id: `USR-STD-${cleanNipd}`,
          email: `${student.nipd.replace(/\s+/g, '')}@siswa.sch.id`,
          username: student.nipd,
          nama: student.nama,
          role: officer.role,
          password: '123',
          nipd: student.nipd,
          rombelId: officer.rombelId,
          jabatan: `${officer.role === 'ketua_kelas' ? 'Ketua Kelas' : 'Sekretaris'} ${officer.rombelNama}`,
          statusAktif: true,
        };
        consolidatedUsers.push(newAccount);
        processedNipds.add(nipd);
        changesCount++;
      }
    }
  });

  return {
    updatedUsers: consolidatedUsers,
    changesCount,
  };
}

/**
 * Memastikan 1 akun untuk siswa tertentu jika ditunjuk / diperbarui
 */
export function ensureSingleStudentOfficerAccount(
  student: Student,
  role: 'siswa' | 'ketua_kelas' | 'sekretaris',
  rombelNama?: string,
  existingUsers: UserAccount[] = []
): UserAccount {
  const cleanNipd = cleanNipdString(student.nipd);
  const targetJabatan =
    role === 'ketua_kelas'
      ? `Ketua Kelas ${rombelNama || ''}`.trim()
      : role === 'sekretaris'
      ? `Sekretaris ${rombelNama || ''}`.trim()
      : `Siswa ${rombelNama || ''}`.trim();

  // Cari apakah user sudah ada berdasarkan NIPD atau username
  const existing = existingUsers.find(
    (u) => u.nipd === student.nipd || u.username === student.nipd
  );

  if (existing) {
    return {
      ...existing,
      role,
      jabatan: targetJabatan,
      rombelId: student.rombelId,
      nama: student.nama,
      nipd: student.nipd,
      statusAktif: true,
    };
  }

  return {
    id: `USR-STD-${cleanNipd}`,
    email: `${student.nipd.replace(/\s+/g, '')}@siswa.sch.id`,
    username: student.nipd,
    nama: student.nama,
    role,
    password: '123',
    nipd: student.nipd,
    rombelId: student.rombelId,
    jabatan: targetJabatan,
    statusAktif: true,
  };
}
