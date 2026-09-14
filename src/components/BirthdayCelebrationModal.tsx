import React from 'react';
import { UserAccount, Student } from '../types';
import { Cake, Sparkles, Heart, X, Award, Gift, PartyPopper } from 'lucide-react';

interface BirthdayCelebrationModalProps {
  user: UserAccount;
  student?: Student | null;
  age?: number;
  birthdayWish: string;
  onClose: () => void;
}

export const BirthdayCelebrationModal: React.FC<BirthdayCelebrationModalProps> = ({
  user,
  student,
  age,
  birthdayWish,
  onClose,
}) => {
  const photo = user.foto || student?.foto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200 text-center animate-in zoom-in-95 duration-300">
        {/* Festive Background Header */}
        <div className="bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 p-6 text-white relative overflow-hidden">
          {/* Decorative Sparkles & Confetti Circles */}
          <div className="absolute top-2 left-4 text-amber-200/80 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute top-3 right-6 text-yellow-200/80 animate-pulse">
            <PartyPopper className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xs" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-300/20 rounded-full blur-xs" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 transition z-10"
            title="Tutup ucapan"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Profile Photo with Birthday Badge */}
          <div className="relative inline-block mt-2">
            {photo ? (
              <img
                src={photo}
                alt={user.nama}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl mx-auto bg-slate-100 ring-4 ring-amber-300/60"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 border-4 border-white shadow-xl mx-auto flex items-center justify-center text-3xl font-black text-white ring-4 ring-amber-300/60">
                {user.nama.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 p-2 bg-amber-400 text-slate-900 rounded-full shadow-lg border-2 border-white animate-spin-slow">
              <Cake className="w-5 h-5 text-rose-600" />
            </span>
          </div>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-extrabold uppercase tracking-wider text-white border border-white/30">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              Hari Istimewa Anda!
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight drop-shadow-xs">
              Selamat Ulang Tahun!
            </h2>
            {age !== undefined && (
              <p className="text-xs font-semibold text-amber-100">
                Genap Berusia <span className="text-yellow-300 font-black text-sm">{age} Tahun</span> Hari Ini 🎂
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              {user.nama}
            </h3>
            {user.nipd && (
              <p className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
                NIPD: {user.nipd} {student?.rombelId ? `• Rombel: ${student.rombelId}` : ''}
              </p>
            )}
          </div>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed space-y-2">
            <p className="font-medium">
              {birthdayWish || (
                <>
                  Seluruh keluarga besar <strong>SMKN 1 KELAPA KAMPIT</strong> mengucapkan Selamat Ulang Tahun! Semoga senantiasa diberikan kesehatan yang prima, keberkahan umur, kemudahan dalam menuntut ilmu, dan tercapai seluruh cita-cita Anda.
                </>
              )}
            </p>
          </div>

          {/* Quick festive tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-semibold">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Sehat Selalu
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold">
              <Gift className="w-3 h-3 text-amber-600" /> Berkah & Bahagia
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold">
              <Award className="w-3 h-3 text-emerald-600" /> Sukses Berprestasi
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Aamiin, Terima Kasih Banyak! 🥳</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
