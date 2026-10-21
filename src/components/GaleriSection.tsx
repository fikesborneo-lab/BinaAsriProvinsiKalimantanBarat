import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { GaleriItem } from '../types';
import { Maximize2, Plus, Edit2, Trash2 } from 'lucide-react';

interface GaleriSectionProps {
  onOpenAddGaleri: () => void;
  onOpenLightbox: (item: GaleriItem) => void;
  onOpenEditSectionHeader: (prefix: 'program' | 'berita' | 'galeri' | 'pengurus') => void;
}

export const GaleriSection: React.FC<GaleriSectionProps> = ({
  onOpenAddGaleri,
  onOpenLightbox,
  onOpenEditSectionHeader
}) => {
  const { galeri, deleteGaleri, adminSession } = useFoundation();

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold tracking-wider uppercase mb-3">
            <EditableText contentKey="galeri_tag" as="span" />
          </div>
          <EditableText
            contentKey="galeri_title"
            as="h2"
            className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-4"
          />
          <EditableText
            contentKey="galeri_desc"
            as="p"
            multiline
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          />

          {adminSession && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => onOpenEditSectionHeader('galeri')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Judul Galeri</span>
              </button>
              <button
                onClick={onOpenAddGaleri}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto Galeri</span>
              </button>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {galeri.length > 0 ? (
            galeri.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm hover:shadow-xl cursor-pointer"
              >
                <img
                  src={item.gambar}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onClick={() => onOpenLightbox(item)}
                />

                {/* Dark Gradient Overlay */}
                <div
                  onClick={() => onOpenLightbox(item)}
                  className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5 text-white"
                >
                  <h5 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2 mb-1">
                    {item.judul}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-200">
                    <Maximize2 className="w-3 h-3" />
                    <span>Klik untuk perbesar</span>
                  </div>
                </div>

                {/* Direct Admin Delete Button */}
                {adminSession && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus foto "${item.judul}" dari galeri?`)) {
                        deleteGaleri(item.id);
                      }
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg transition-all z-20"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              Belum ada foto dalam galeri dokumentasi.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
