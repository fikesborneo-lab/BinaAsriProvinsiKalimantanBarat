import React from 'react';
import { GaleriItem } from '../../types';
import { X } from 'lucide-react';

interface GaleriLightboxModalProps {
  item: GaleriItem | null;
  onClose: () => void;
}

export const GaleriLightboxModal: React.FC<GaleriLightboxModalProps> = ({ item, onClose }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative max-w-4xl w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all shadow-lg"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <img
          src={item.gambar}
          alt={item.judul}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10 mx-auto"
        />

        <div className="mt-4 px-4 py-2.5 rounded-xl bg-slate-900/80 inline-block max-w-xl backdrop-blur-sm border border-white/10 text-white font-bold text-sm sm:text-base">
          {item.judul}
        </div>
      </div>
    </div>
  );
};
