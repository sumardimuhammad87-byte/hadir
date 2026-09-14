import React, { useEffect, useState, useRef } from 'react';
import { Student, Rombel, SchoolConfig } from '../types';
import { generateQrDataUrl } from '../utils/qrcode';
import { X, Download, Printer, User, QrCode } from 'lucide-react';

interface StudentCardModalProps {
  student: Student | null;
  rombel?: Rombel;
  schoolConfig: SchoolConfig;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  rombel,
  schoolConfig,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (student) {
      generateQrDataUrl(student.nipd).then(url => setQrUrl(url));
    }
  }, [student]);

  if (!student) return null;

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR-NIPD-${student.nipd.replace(/[^a-zA-Z0-9]/g, '_')}-${student.nama}.png`;
    a.click();
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div id="modal-student-card" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Kartu Pelajar & QR Code NIPD</h3>
          </div>
          <button
            id="btn-close-student-card"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Physical Printable Card Representation */}
          <div
            ref={cardRef}
            className="border-2 border-emerald-600 rounded-xl p-5 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md relative overflow-hidden"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
              <div className="flex items-center gap-3">
                {schoolConfig.logoUrl ? (
                  <img
                    src={schoolConfig.logoUrl}
                    alt="Logo Sekolah"
                    className="w-12 h-12 object-contain rounded-md bg-white p-1 border border-emerald-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                    SMK
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm uppercase leading-tight tracking-wide">
                    {schoolConfig.namaSekolah}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    {schoolConfig.alamatSekolah}, {schoolConfig.kotaKab}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    KARTU IDENTITAS & ABSENSI SISWA
                  </span>
                </div>
              </div>
            </div>

            {/* Student Info, Photo & QR */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Photo & QR Code Column */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs space-y-2">
                {/* Pasfoto Siswa 3x4 */}
                <div className="relative">
                  {student.foto ? (
                    <img
                      src={student.foto}
                      alt={`Pasfoto ${student.nama}`}
                      className="w-20 h-28 object-cover rounded-md border-2 border-emerald-500 shadow-xs bg-slate-100"
                    />
                  ) : (
                    <div className="w-20 h-28 rounded-md border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                      <User className="w-8 h-8 text-emerald-400 mb-0.5" />
                      <span className="text-[8px] font-semibold text-emerald-700 leading-tight">Pasfoto 3x4</span>
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded shadow-xs">
                    {student.jk}
                  </span>
                </div>

                {/* QR Code Barcode Absensi */}
                <div className="text-center">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt={`QR Code NIPD ${student.nipd}`}
                      className="w-24 h-24 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-slate-400 text-[10px]">
                      Memuat QR...
                    </div>
                  )}
                  <span className="text-[10px] font-mono font-bold text-emerald-800 mt-1 inline-block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {student.nipd}
                  </span>
                </div>
              </div>

              {/* Bio Details Column */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Nama Lengkap Siswa:</span>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{student.nama}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <span className="text-slate-500 text-[10px] block">NIPD (ID Unik):</span>
                    <p className="font-mono font-bold text-emerald-700 text-[11px]">{student.nipd}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">NISN:</span>
                    <p className="font-mono font-semibold text-slate-800 text-[11px]">{student.nisn}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rombel / Kelas:</span>
                    <p className="font-semibold text-slate-800 text-[11px]">{rombel?.nama || student.rombelId}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Jenis Kelamin:</span>
                    <p className="font-medium text-slate-800 text-[11px]">
                      {student.jk === 'P' ? 'Perempuan (P)' : 'Laki-Laki (L)'}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Tempat, Tanggal Lahir:</span>
                  <p className="text-slate-700 text-[11px]">{student.tempatLahir}, {student.tanggalLahir}</p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Status: <strong className="text-emerald-700">Aktif Terdaftar</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] text-slate-500">
              <span>Gunakan kartu ini untuk scan barcode / QR absensi harian</span>
              <span className="italic">Status: Aktif</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              id="btn-download-qr-file"
              onClick={handleDownloadQr}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              Unduh QR Code (PNG)
            </button>
            <button
              id="btn-print-student-card"
              onClick={handlePrintCard}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2 transition shadow-md hover:shadow-lg"
            >
              <Printer className="w-4 h-4" />
              Cetak Kartu Pelajar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
