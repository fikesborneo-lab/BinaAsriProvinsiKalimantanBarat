import React from 'react';
import { BeritaItem } from '../../types';
import { X, Calendar, Share2 } from 'lucide-react';

interface BeritaReaderModalProps {
  berita: BeritaItem | null;
  onClose: () => void;
}

export const BeritaReaderModal: React.FC<BeritaReaderModalProps> = ({ berita, onClose }) => {
  if (!berita) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: berita.judul,
        text: berita.ringkasan,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan halaman berhasil disalin!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 shadow-md flex items-center justify-center transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        {berita.gambar && (
          <div className="w-full h-64 sm:h-80 relative overflow-hidden bg-slate-100 rounded-t-3xl">
            <img
              src={berita.gambar}
              alt={berita.judul}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-4 left-4 bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow">
              {berita.kategori || 'Berita'}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Calendar className="w-4 h-4" />
              <span>{berita.tanggal || 'Kabar Terbaru'}</span>
              <span>• Yayasan Bina Asri Kalbar</span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 transition-colors p-1 rounded"
              title="Bagikan Berita"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-5">
            {berita.judul}
          </h2>

          <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {berita.konten || berita.ringkasan}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Tutup Berita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
