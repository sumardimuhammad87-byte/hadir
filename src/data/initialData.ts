import { Student, Rombel, UserAccount, SchoolConfig, AttendanceRecord, Teacher, Subject, ScheduleItem } from '../types';

export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  namaSekolah: 'SMK Bakti Putra Mandiri',
  alamatSekolah: 'Jl. Pemuda Raya No. 45, Komplek Pendidikan Citra',
  kelurahan: 'Tanah Sareal',
  kecamatan: 'Tanah Sareal',
  kotaKab: 'Kota Bogor',
  provinsi: 'Jawa Barat',
  telepon: '(0251) 8345678',
  email: 'info@smkbaktiputramandiri.sch.id',
  website: 'www.smkbaktiputramandiri.sch.id',
  namaKepalaSekolah: 'Dra. Hj. Nurhayati, M.Pd.',
  nipKepalaSekolah: '19740512 199803 2 004',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
  jamMasuk: '07:00',
  jamBatasMasuk: '07:30',
  totalHariEfektifSemester: 110,
};

export const INITIAL_ROMBEL: Rombel[] = [
  {
    id: 'ROMBEL-X',
    nama: 'Kelas X',
    tingkat: 'X',
    jurusan: 'Dasar Kejuruan Kesehatan',
    waliKelasNama: 'Budi Santoso, S.Pd.',
    waliKelasNip: '19820315 200604 1 008',
    ketuaKelasNipd: '26.27.10.002', // CINTA DWI SHAVIRA
    sekretarisNipd: '26.27.10.003', // DESVITA NUR OKTAVIANI
  },
  {
    id: 'ROMBEL-XI-FAR',
    nama: 'Kelas XI Asisten Farmasi',
    tingkat: 'XI',
    jurusan: 'Farmasi Klinis dan Komunitas',
    waliKelasNama: 'Apt. Siti Rohmah, S.Farm.',
    waliKelasNip: '19880421 201102 2 006',
    ketuaKelasNipd: '25.26.10.004', // ANGGRAINI
    sekretarisNipd: '25.26.10.006', // Dinda Khoirunnisa
  },
  {
    id: 'ROMBEL-XI-KEP',
    nama: 'Kelas XI Asisten Keperawatan',
    tingkat: 'XI',
    jurusan: 'Layanan Kesehatan & Keperawatan',
    waliKelasNama: 'Ns. Ratna Dewi, S.Kep.',
    waliKelasNip: '19850912 200903 2 005',
    ketuaKelasNipd: '25.26.10.005', // ATINA NAHYA ARUMWANGI
    sekretarisNipd: '25.26.10.001', // AIRIN TAZKIATUL UMMAH
  },
  {
    id: 'ROMBEL-XII-FAR',
    nama: 'Kelas XII Asisten Farmasi',
    tingkat: 'XII',
    jurusan: 'Farmasi Klinis dan Komunitas',
    waliKelasNama: 'Apt. Hendra Pratama, M.Farm.',
    waliKelasNip: '19790610 200501 1 009',
    ketuaKelasNipd: '24.25.10.001', // A'INUN LATIFAH
    sekretarisNipd: '24.25.10.005', // DINDA JULLIANTINY
  },
  {
    id: 'ROMBEL-XII-KEP',
    nama: 'Kelas XII Asisten Keperawatan',
    tingkat: 'XII',
    jurusan: 'Layanan Kesehatan & Keperawatan',
    waliKelasNama: 'Ns. Dian Anggraeni, S.Kep.',
    waliKelasNip: '19830214 200804 2 003',
    ketuaKelasNipd: '24.25.10.002', // ALIN PUTRI UTAMI
    sekretarisNipd: '24.25.10.004', // DEWI HABSYAH
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // --- Kelas X (12 Siswa) ---
  { nipd: '26.27.10.002', nisn: '0117573036', nama: 'CINTA DWI SHAVIRA', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2011-02-02', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.003', nisn: '0101519178', nama: 'DESVITA NUR OKTAVIANI', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2010-10-26', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.004', nisn: '0109884223', nama: 'DIRA RAHMA AULIA', jk: 'P', tempatLahir: 'Tangerang', tanggalLahir: '2010-10-11', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.005', nisn: '3119518560', nama: 'HALA HAYATI AFIFAH', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2011-05-26', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.006', nisn: '0115731832', nama: 'INDAH NAZWA SALSABILA', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2011-02-14', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.007', nisn: '0118683745', nama: 'Indriyanti', jk: 'P', tempatLahir: 'Tangerang', tanggalLahir: '2011-06-06', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.008', nisn: '0111574151', nama: 'KHARISA OCTAVIANI', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2011-10-19', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.009', nisn: '0119205058', nama: 'PUTRI ALIYA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2011-06-14', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.010', nisn: '0108321011', nama: 'SALSABILA ANINDYA PUTRI', jk: 'P', tempatLahir: 'CIREBON', tanggalLahir: '2010-10-03', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.011', nisn: '0112875155', nama: 'SHABRINA NAJWA KAMILA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2011-03-15', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.012', nisn: '3103116310', nama: 'SHALWA NURDIANSYAH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-10-08', rombelId: 'ROMBEL-X', statusAktif: true },
  { nipd: '26.27.10.013', nisn: '0111892889', nama: 'ZAHRA DININGRUM', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2011-07-13', rombelId: 'ROMBEL-X', statusAktif: true },

  // --- Kelas XI Asisten Farmasi (11 Siswa) ---
  { nipd: '25.26.10.004', nisn: '3091963666', nama: 'ANGGRAINI', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2009-07-19', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.006', nisn: '0099704594', nama: 'Dinda Khoirunnisa Hidayat', jk: 'P', tempatLahir: 'Tangerang', tanggalLahir: '2009-09-07', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.007', nisn: '0109200323', nama: 'ELIA APRILIA', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2010-04-07', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.012', nisn: '0098934924', nama: 'IMELLIA NUR BAKHRI', jk: 'P', tempatLahir: 'Brebes', tanggalLahir: '2009-10-08', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.018', nisn: '0105863749', nama: 'KINANTI AIRRANI PURWANTO', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2010-01-22', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.021', nisn: '3103919729', nama: 'NABILA AZZAHRA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-05-06', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.026', nisn: '0107675662', nama: 'NEYSHA ANDRIANI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-06-17', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.031', nisn: '0099327499', nama: 'REZKY ANGRAENI PANJAITAN', jk: 'P', tempatLahir: 'PANIARAN', tanggalLahir: '2009-10-03', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.032', nisn: '3105218085', nama: 'SILVY AULIA RAHMA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-06-29', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.023', nisn: '3101209433', nama: 'NAJWATUN NAFIS', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2010-08-12', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },
  { nipd: '25.26.10.036', nisn: '0094496503', nama: 'AISYAH NUR FAUZIAH', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2009-07-28', rombelId: 'ROMBEL-XI-FAR', statusAktif: true },

  // --- Kelas XI Asisten Keperawatan (21 Siswa) ---
  { nipd: '25.26.10.005', nisn: '0108095599', nama: 'ATINA NAHYA ARUMWANGI', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2010-06-15', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.001', nisn: '3102094423', nama: 'AIRIN TAZKIATUL UMMAH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-01-06', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.002', nisn: '3105067428', nama: 'ALIN NUR APRILIA', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2010-04-22', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.003', nisn: '0106060074', nama: 'ANDITA AL-FITRIANI', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2010-09-10', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.008', nisn: '0104904474', nama: 'FIDYA AURA FEBRINA', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2010-02-28', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.009', nisn: '0103226391', nama: 'FISKA AGUSTIN', jk: 'P', tempatLahir: 'Tangerang', tanggalLahir: '2010-08-06', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.010', nisn: '0103566716', nama: 'GREACE FEBRISELA ARING', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-02-02', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.013', nisn: '3107215634', nama: 'INDIRA CANDRA MAOLIDIA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-02-20', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.014', nisn: '0103635979', nama: 'JESSICA AMI NUGRAHA', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2010-04-05', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.015', nisn: '0095257645', nama: 'Jihan Aulya Putri', jk: 'P', tempatLahir: 'Jakarta', tanggalLahir: '2009-09-10', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.017', nisn: '0097114577', nama: 'KAYLA MUTIA HANDAYANI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-12-21', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.019', nisn: '0101124340', nama: 'MARSYA DWI RIYANTI', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2010-03-28', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.022', nisn: '0093990285', nama: 'NADIVA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-12-02', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.024', nisn: '0107868497', nama: 'NAZWA APRILIA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-04-25', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.025', nisn: '0093198847', nama: 'NAZWA PUTRI AISYAH', jk: 'P', tempatLahir: 'Pati', tanggalLahir: '2009-10-02', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.027', nisn: '0101742334', nama: 'NIKI DHITIA HANDAYANI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-05-21', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.035', nisn: '0108902030', nama: 'NURMILA ANGGITA', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2010-01-13', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.028', nisn: '3095468000', nama: 'OKTAVIA AMALIA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-10-31', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.029', nisn: '0099410863', nama: 'PUTRI SYAKILA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-09-23', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.033', nisn: '0099077689', nama: 'Suci Elka Kirana', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2009-03-24', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },
  { nipd: '25.26.10.034', nisn: '0091352087', nama: 'VANESYA PUTRI AMANDARI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-10-23', rombelId: 'ROMBEL-XI-KEP', statusAktif: true },

  // --- Kelas XII Asisten Farmasi (12 Siswa) ---
  { nipd: '24.25.10.001', nisn: '0094701443', nama: "A'INUN LATIFAH", jk: 'P', tempatLahir: 'JEPARA', tanggalLahir: '2009-01-20', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.005', nisn: '0095314358', nama: 'DINDA JULLIANTINY WIJAYA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-07-13', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.007', nisn: '0081407803', nama: 'DWI SARAH', jk: 'P', tempatLahir: 'BLORA', tanggalLahir: '2008-07-07', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.010', nisn: '3092699705', nama: "HURUL A'INI PUTRI", jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2009-08-10', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.014', nisn: '0097799282', nama: 'KEIYLA UTAMI LUTFIFAH', jk: 'P', tempatLahir: 'TANGERANG', tanggalLahir: '2009-09-28', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.017', nisn: '0073980248', nama: 'KHOIRUN NISA', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2007-10-22', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.021', nisn: '0083183812', nama: 'NABILA KHAIRANI RAMADHANTI', jk: 'P', tempatLahir: 'LEBONG', tanggalLahir: '2008-09-17', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.022', nisn: '0091204399', nama: 'NAYZIRA YONA VORTUNA PUTRI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-03-01', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.023', nisn: '0092740208', nama: 'NEISYA NUR AULIA', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2009-03-22', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.031', nisn: '0092040539', nama: 'SILVIATU ASSYIFA', jk: 'P', tempatLahir: 'JAKARTA', tanggalLahir: '2009-01-11', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.035', nisn: '0081650207', nama: 'TIARA MUSLIMAH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2008-09-25', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },
  { nipd: '24.25.10.036', nisn: '0099113676', nama: 'Ummu Aulia Rahma', jk: 'P', tempatLahir: 'Tangerang Selatan', tanggalLahir: '2009-02-22', rombelId: 'ROMBEL-XII-FAR', statusAktif: true },

  // --- Kelas XII Asisten Keperawatan (21 Siswa) ---
  { nipd: '24.25.10.002', nisn: '3087159255', nama: 'ALIN PUTRI UTAMI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2008-10-07', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.004', nisn: '0092132446', nama: 'DEWI HABSYAH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-03-03', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.006', nisn: '0154396877', nama: 'DIRA PRATIWI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-01-13', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.008', nisn: '3090638963', nama: 'ERLIN', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-06-13', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.009', nisn: '0099043847', nama: 'HILMA AULIA', jk: 'P', tempatLahir: 'Tangerang', tanggalLahir: '2009-07-26', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.012', nisn: '0091944364', nama: 'JIHAN JULISTIA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-05-16', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.013', nisn: '0088714003', nama: 'JOY ULINA STEVANY MUNTHE', jk: 'P', tempatLahir: 'SAROLANGUN', tanggalLahir: '2008-07-28', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.015', nisn: '0097982143', nama: 'KEIZHA SEPTIANI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-12-24', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.016', nisn: '0097731645', nama: 'KEYSHA PUTRI', jk: 'P', tempatLahir: 'Bogor', tanggalLahir: '2009-02-23', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.018', nisn: '3093738813', nama: 'MASAYU ALMA QVIRA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-01-17', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.019', nisn: '0091657994', nama: 'MELISA ANDINI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-05-05', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.020', nisn: '0099559631', nama: 'MUNAWAROH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-02-20', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.024', nisn: '3101498021', nama: 'NESA ANGGRAENI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2010-10-25', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.025', nisn: '3093584005', nama: 'NINDA AULIA', jk: 'P', tempatLahir: 'Tangerang ', tanggalLahir: '2009-12-19', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.026', nisn: '0098840056', nama: 'NURUL MAULINDA PUTRI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-04-20', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.028', nisn: '0092625422', nama: 'PUTRI ANUGRAH KHUMAEROH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-07-30', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.029', nisn: '0081860104', nama: 'RAFICCA RAHMA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2008-11-28', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.030', nisn: '0093232136', nama: 'RAHMA LISTIANI', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-01-09', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.032', nisn: '0092094297', nama: 'SITI ZAHRA YULIANINGSIH', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-05-10', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.033', nisn: '0097964334', nama: 'SRI MUSTIKA RAHAYU', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-08-27', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
  { nipd: '24.25.10.034', nisn: '0098489136', nama: 'TAZKIATUL AULIA', jk: 'P', tempatLahir: 'BOGOR', tanggalLahir: '2009-04-14', rombelId: 'ROMBEL-XII-KEP', statusAktif: true },
];

export const INITIAL_USERS: UserAccount[] = [
  // 1. Superuser Admin (as explicitly requested: absensirapot@gmail.com / admin123)
  {
    id: 'USR-ADMIN',
    email: 'absensirapot@gmail.com',
    username: 'admin',
    nama: 'Administrator Sistem',
    role: 'admin',
    password: 'admin123',
    jabatan: 'Superuser / IT Administrator',
    statusAktif: true,
  },
  // 2. Guru Piket / Pengajar
  {
    id: 'USR-GURU-1',
    email: 'guru.piket@sekolah.sch.id',
    username: 'guru_piket',
    nama: 'Ahmad Fauzi, S.Pd.',
    role: 'guru',
    password: 'guru123',
    jabatan: 'Guru Piket & Kurikulum',
    statusAktif: true,
  },
  // 3. Staf Tata Usaha / Pimpinan
  {
    id: 'USR-STAF-1',
    email: 'tatausaha@sekolah.sch.id',
    username: 'staf_tu',
    nama: 'Dewi Lestari, S.E.',
    role: 'staf',
    password: 'staf123',
    jabatan: 'Staf Tata Usaha / Kesiswaan',
    statusAktif: true,
  },
  // 4. Wali Kelas (Walas XI Farmasi)
  {
    id: 'USR-WALAS-XIFAR',
    email: 'walas.xifar@sekolah.sch.id',
    username: 'walas_xifar',
    nama: 'Apt. Siti Rohmah, S.Farm.',
    role: 'walas',
    password: 'walas123',
    rombelId: 'ROMBEL-XI-FAR',
    jabatan: 'Wali Kelas XI Farmasi',
    statusAktif: true,
  },
  // 5. Wali Kelas (Walas X)
  {
    id: 'USR-WALAS-X',
    email: 'walas.x@sekolah.sch.id',
    username: 'walas_x',
    nama: 'Budi Santoso, S.Pd.',
    role: 'walas',
    password: 'walas123',
    rombelId: 'ROMBEL-X',
    jabatan: 'Wali Kelas X',
    statusAktif: true,
  },
  // 6. Ketua Kelas (Ketua Kelas XI Farmasi: ANGGRAINI, NIPD: 25.26.10.004)
  {
    id: 'USR-KETUA-XIFAR',
    email: 'ketua.xifar@siswa.sch.id',
    username: 'ketua_xifar',
    nama: 'ANGGRAINI (Ketua Kelas)',
    role: 'ketua_kelas',
    password: 'ketua123',
    nipd: '25.26.10.004',
    rombelId: 'ROMBEL-XI-FAR',
    jabatan: 'Ketua Kelas XI Asisten Farmasi',
    statusAktif: true,
  },
  // 7. Sekretaris Kelas (Sekretaris Kelas XI Farmasi: Dinda Khoirunnisa, NIPD: 25.26.10.006)
  {
    id: 'USR-SEK-XIFAR',
    email: 'sekretaris.xifar@siswa.sch.id',
    username: 'sek_xifar',
    nama: 'Dinda Khoirunnisa Hidayat (Sekretaris)',
    role: 'sekretaris',
    password: 'sek123',
    nipd: '25.26.10.006',
    rombelId: 'ROMBEL-XI-FAR',
    jabatan: 'Sekretaris Kelas XI Asisten Farmasi',
    statusAktif: true,
  },
  // 8. Contoh Akun Siswa (CINTA DWI SHAVIRA - Kelas X, NIPD: 26.27.10.002)
  {
    id: 'USR-SISWA-1',
    email: '26.27.10.002@siswa.sch.id',
    username: '26.27.10.002',
    nama: 'CINTA DWI SHAVIRA',
    role: 'siswa',
    password: '123',
    nipd: '26.27.10.002',
    rombelId: 'ROMBEL-X',
    jabatan: 'Siswa Kelas X',
    statusAktif: true,
  },
];

// Helper to generate seed attendance records for today & recent dates
export function generateInitialAttendance(students: Student[], dateStr: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const times = ['06:48:12', '06:51:30', '06:55:04', '07:02:15', '07:11:42', '07:18:09', '07:22:45'];

  students.forEach((student, idx) => {
    // Determine realistic status: most hadir, a few sakit/izin/alfa
    let status: 'hadir' | 'sakit' | 'izin' | 'alfa' = 'hadir';
    let metode: 'qr_scan' | 'token' | 'manual_admin' | 'manual_guru' | 'manual_pengurus' = 'qr_scan';
    let ket = 'Tepat waktu';

    if (idx % 19 === 0) {
      status = 'sakit';
      metode = 'manual_admin';
      ket = 'Surat keterangan dokter terlampir';
    } else if (idx % 23 === 0) {
      status = 'izin';
      metode = 'manual_pengurus';
      ket = 'Keperluan keluarga mendesak';
    } else if (idx % 37 === 0) {
      status = 'alfa';
      metode = 'manual_admin';
      ket = 'Tanpa konfirmasi';
    } else if (idx % 4 === 0) {
      metode = 'token';
      ket = 'Absen mandiri via token rombel';
    }

    records.push({
      id: `ATT-${dateStr}-${student.nipd.replace(/\./g, '')}`,
      nipd: student.nipd,
      rombelId: student.rombelId,
      tanggal: dateStr,
      waktu: status === 'hadir' ? times[idx % times.length] : '07:00:00',
      status,
      metode,
      recordedByRole: metode === 'manual_admin' ? 'admin' : (metode === 'token' ? 'siswa' : 'guru'),
      recordedByName: metode === 'manual_admin' ? 'Administrator' : (metode === 'token' ? student.nama : 'Guru Piket'),
      keterangan: ket,
    });
  });

  return records;
}

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'GUR-001',
    nip: '19820315 200604 1 008',
    nama: 'Budi Santoso, S.Pd.',
    jk: 'L',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Dasar-dasar Layanan Kesehatan', 'Anatomi Fisiologi'],
    rombelWaliKelasId: 'ROMBEL-X',
    telepon: '081287654321',
    email: 'budi.santoso@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-002',
    nip: '19880421 201102 2 006',
    nama: 'Apt. Siti Rohmah, S.Farm.',
    jk: 'P',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Farmakologi & Toksikologi', 'Farmakognosi'],
    rombelWaliKelasId: 'ROMBEL-XI-FAR',
    telepon: '081398765432',
    email: 'siti.rohmah@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-003',
    nip: '19850912 200903 2 005',
    nama: 'Ns. Ratna Dewi, S.Kep.',
    jk: 'P',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Kebutuhan Dasar Manusia', 'Komunikasi Keperawatan'],
    rombelWaliKelasId: 'ROMBEL-XI-KEP',
    telepon: '085712345678',
    email: 'ratna.dewi@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-004',
    nip: '19790610 200501 1 009',
    nama: 'Apt. Hendra Pratama, M.Farm.',
    jk: 'L',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Pelayanan Farmasi & Manajemen Obat', 'Kimia Farmasi Analisis'],
    rombelWaliKelasId: 'ROMBEL-XII-FAR',
    telepon: '081901234567',
    email: 'hendra.pratama@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-005',
    nip: '19830214 200804 2 003',
    nama: 'Ns. Dian Anggraeni, S.Kep.',
    jk: 'P',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Keterampilan Dasar Tindakan Keperawatan', 'Ilmu Kesehatan Masyarakat'],
    rombelWaliKelasId: 'ROMBEL-XII-KEP',
    telepon: '087812348765',
    email: 'dian.anggraeni@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-006',
    nip: '19760814 200302 1 004',
    nama: 'Drs. Ahmad Fauzi, M.Pd.',
    jk: 'L',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Matematika Terapan'],
    telepon: '081234567890',
    email: 'ahmad.fauzi@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-007',
    nip: '19890105 201403 2 007',
    nama: 'Sri Wahyuni, S.Pd.',
    jk: 'P',
    statusKepegawaian: 'PPPK',
    mataPelajaran: ['Bahasa Indonesia'],
    telepon: '082198765432',
    email: 'sri.wahyuni@smkhusada.sch.id',
    statusAktif: true,
  },
  {
    id: 'GUR-008',
    nip: '19750218 200201 1 005',
    nama: 'H. M. Ridwan, S.Ag., M.Pd.I.',
    jk: 'L',
    statusKepegawaian: 'PNS',
    mataPelajaran: ['Pendidikan Agama & Budi Pekerti'],
    telepon: '081512349876',
    email: 'm.ridwan@smkhusada.sch.id',
    statusAktif: true,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'MAPEL-001',
    kode: 'FAR-01',
    nama: 'Farmakologi & Toksikologi',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'XI',
    jurusan: 'Asisten Farmasi',
    jamPerMinggu: 4,
    statusAktif: true,
  },
  {
    id: 'MAPEL-002',
    kode: 'FAR-02',
    nama: 'Farmakognosi',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'XI',
    jurusan: 'Asisten Farmasi',
    jamPerMinggu: 3,
    statusAktif: true,
  },
  {
    id: 'MAPEL-003',
    kode: 'FAR-03',
    nama: 'Pelayanan Farmasi & Administrasi Obat',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'XII',
    jurusan: 'Asisten Farmasi',
    jamPerMinggu: 4,
    statusAktif: true,
  },
  {
    id: 'MAPEL-004',
    kode: 'KEP-01',
    nama: 'Kebutuhan Dasar Manusia (KDM)',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'XI',
    jurusan: 'Asisten Keperawatan',
    jamPerMinggu: 4,
    statusAktif: true,
  },
  {
    id: 'MAPEL-005',
    kode: 'KEP-02',
    nama: 'Keterampilan Dasar Tindakan Keperawatan (KDTK)',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'XII',
    jurusan: 'Asisten Keperawatan',
    jamPerMinggu: 5,
    statusAktif: true,
  },
  {
    id: 'MAPEL-006',
    kode: 'KES-01',
    nama: 'Dasar-dasar Layanan Kesehatan',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'X',
    jurusan: 'Dasar Kejuruan Kesehatan',
    jamPerMinggu: 4,
    statusAktif: true,
  },
  {
    id: 'MAPEL-007',
    kode: 'KES-02',
    nama: 'Anatomi & Fisiologi Manusia',
    kelompok: 'Peminatan Kejuruan (C)',
    tingkat: 'X',
    jurusan: 'Dasar Kejuruan Kesehatan',
    jamPerMinggu: 3,
    statusAktif: true,
  },
  {
    id: 'MAPEL-008',
    kode: 'UMUM-01',
    nama: 'Matematika Terapan',
    kelompok: 'Muatan Nasional (A)',
    tingkat: 'Semua',
    jurusan: 'Semua',
    jamPerMinggu: 3,
    statusAktif: true,
  },
  {
    id: 'MAPEL-009',
    kode: 'UMUM-02',
    nama: 'Bahasa Indonesia',
    kelompok: 'Muatan Nasional (A)',
    tingkat: 'Semua',
    jurusan: 'Semua',
    jamPerMinggu: 2,
    statusAktif: true,
  },
  {
    id: 'MAPEL-010',
    kode: 'UMUM-03',
    nama: 'Pendidikan Agama & Budi Pekerti',
    kelompok: 'Muatan Nasional (A)',
    tingkat: 'Semua',
    jurusan: 'Semua',
    jamPerMinggu: 3,
    statusAktif: true,
  },
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  // Kelas X
  {
    id: 'SCH-X-01',
    rombelId: 'ROMBEL-X',
    hari: 'Senin',
    jamKe: '1 - 2 (07:15 - 08:45)',
    jamMulai: '07:15',
    jamSelesai: '08:45',
    subjectId: 'MAPEL-006', // Dasar Layanan Kes
    teacherId: 'GUR-001',   // Budi Santoso
    ruangan: 'Ruang Teori X-A',
    keterangan: 'Teori pengantar kesehatan',
  },
  {
    id: 'SCH-X-02',
    rombelId: 'ROMBEL-X',
    hari: 'Senin',
    jamKe: '3 - 4 (09:00 - 10:30)',
    jamMulai: '09:00',
    jamSelesai: '10:30',
    subjectId: 'MAPEL-007', // Anatomi Fisiologi
    teacherId: 'GUR-001',
    ruangan: 'Lab Anatomi & Biologi',
    keterangan: 'Praktikum torso manusia',
  },
  {
    id: 'SCH-X-03',
    rombelId: 'ROMBEL-X',
    hari: 'Selasa',
    jamKe: '1 - 2 (07:15 - 08:45)',
    jamMulai: '07:15',
    jamSelesai: '08:45',
    subjectId: 'MAPEL-008', // Matematika
    teacherId: 'GUR-006',   // Ahmad Fauzi
    ruangan: 'Ruang Teori X-A',
  },
  {
    id: 'SCH-X-04',
    rombelId: 'ROMBEL-X',
    hari: 'Rabu',
    jamKe: '1 - 2 (07:15 - 08:45)',
    jamMulai: '07:15',
    jamSelesai: '08:45',
    subjectId: 'MAPEL-010', // PAI
    teacherId: 'GUR-008',   // H. M. Ridwan
    ruangan: 'Ruang Teori X-A',
  },
  // Kelas XI Farmasi
  {
    id: 'SCH-XI-FAR-01',
    rombelId: 'ROMBEL-XI-FAR',
    hari: 'Senin',
    jamKe: '1 - 2 (07:15 - 08:45)',
    jamMulai: '07:15',
    jamSelesai: '08:45',
    subjectId: 'MAPEL-001', // Farmakologi
    teacherId: 'GUR-002',   // Apt. Siti Rohmah
    ruangan: 'Lab Farmasi Dasar',
    keterangan: 'Penggolongan obat generik',
  },
  {
    id: 'SCH-XI-FAR-02',
    rombelId: 'ROMBEL-XI-FAR',
    hari: 'Selasa',
    jamKe: '1 - 3 (07:15 - 09:30)',
    jamMulai: '07:15',
    jamSelesai: '09:30',
    subjectId: 'MAPEL-002', // Farmakognosi
    teacherId: 'GUR-002',
    ruangan: 'Lab Farmasi Herbal',
    keterangan: 'Identifikasi simplisia tanaman obat',
  },
  // Kelas XI Keperawatan
  {
    id: 'SCH-XI-KEP-01',
    rombelId: 'ROMBEL-XI-KEP',
    hari: 'Senin',
    jamKe: '1 - 3 (07:15 - 09:30)',
    jamMulai: '07:15',
    jamSelesai: '09:30',
    subjectId: 'MAPEL-004', // KDM
    teacherId: 'GUR-003',   // Ns. Ratna Dewi
    ruangan: 'Lab Keperawatan Komprehensif',
    keterangan: 'Praktik pemenuhan oksigenasi & nutrisi',
  },
  {
    id: 'SCH-XI-KEP-02',
    rombelId: 'ROMBEL-XI-KEP',
    hari: 'Kamis',
    jamKe: '1 - 2 (07:15 - 08:45)',
    jamMulai: '07:15',
    jamSelesai: '08:45',
    subjectId: 'MAPEL-009', // Bhs Indonesia
    teacherId: 'GUR-007',   // Sri Wahyuni
    ruangan: 'Ruang Teori XI-KEP',
  },
  // Kelas XII Farmasi
  {
    id: 'SCH-XII-FAR-01',
    rombelId: 'ROMBEL-XII-FAR',
    hari: 'Senin',
    jamKe: '1 - 3 (07:15 - 09:30)',
    jamMulai: '07:15',
    jamSelesai: '09:30',
    subjectId: 'MAPEL-003', // Pelayanan Farmasi
    teacherId: 'GUR-004',   // Apt. Hendra Pratama
    ruangan: 'Lab Dispensing & Apotek Simulasi',
    keterangan: 'Simulasi penerimaan resep & peracikan puyer',
  },
  // Kelas XII Keperawatan
  {
    id: 'SCH-XII-KEP-01',
    rombelId: 'ROMBEL-XII-KEP',
    hari: 'Selasa',
    jamKe: '1 - 3 (07:15 - 09:30)',
    jamMulai: '07:15',
    jamSelesai: '09:30',
    subjectId: 'MAPEL-005', // KDTK
    teacherId: 'GUR-005',   // Ns. Dian Anggraeni
    ruangan: 'Lab Hospital Mini ICU',
    keterangan: 'Pemasangan infus & kateter',
  },
];

