import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { BeritaItem } from '../types';
import { Calendar, ArrowRight, Plus, Edit2, Trash2, ExternalLink, Search, X } from 'lucide-react';

interface BeritaSectionProps {
  onOpenAddBerita: () => void;
  onOpenEditBerita: (item: BeritaItem) => void;
  onOpenReadBerita: (item: BeritaItem) => void;
  onOpenEditSectionHeader: (prefix: 'program' | 'berita' | 'galeri' | 'pengurus') => void;
}

export const BeritaSection: React.FC<BeritaSectionProps> = ({
  onOpenAddBerita,
  onOpenEditBerita,
  onOpenReadBerita,
  onOpenEditSectionHeader
}) => {
  const { berita, deleteBerita, adminSession } = useFoundation();
  const [activeCategory, setActiveCategory] = React.useState<string>('Semua');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const categories = ['Semua', 'Kemitraan', 'Advokasi', 'Pendampingan', 'Sosial', 'Kesehatan'];

  const filteredBerita = berita.filter((item) => {
    const matchesCat = activeCategory === 'Semua' || (item.kategori || '').toLowerCase() === activeCategory.toLowerCase();
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.judul || '').toLowerCase().includes(q) ||
      (item.ringkasan || '').toLowerCase().includes(q) ||
      (item.konten || '').toLowerCase().includes(q) ||
      (item.kategori || '').toLowerCase().includes(q)
    );
  });

  return (
    <section id="berita" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold tracking-wider uppercase mb-3">
            <EditableText contentKey="berita_tag" as="span" />
          </div>
          <EditableText
            contentKey="berita_title"
            as="h2"
            className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-4"
          />
          <EditableText
            contentKey="berita_desc"
            as="p"
            multiline
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          />

          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <a
              href="https://yayasanbinaasri.blogspot.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-emerald-800 hover:text-emerald-950 border border-slate-200 text-xs font-bold shadow-sm transition-all"
            >
              <span>Kunjungi Blogspot Resmi</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>

            {adminSession && (
              <>
                <button
                  onClick={() => onOpenEditSectionHeader('berita')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Judul Berita</span>
                </button>
                <button
                  onClick={onOpenAddBerita}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tulis Berita Baru</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar & Category Tabs */}
        <div className="max-w-3xl mx-auto mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita, kegiatan, atau wilayah (mis: Sambas, Hotline, DPPM)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-sm outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map((cat) => {
              const count = cat === 'Semua' ? berita.length : berita.filter((b) => (b.kategori || '').toLowerCase() === cat.toLowerCase()).length;
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-700/60'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Berita Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBerita.length > 0 ? (
            filteredBerita.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col group"
              >
                {/* Thumbnail Image */}
                <div
                  onClick={() => onOpenReadBerita(item)}
                  className="h-52 overflow-hidden relative bg-slate-100 cursor-pointer"
                >
                  <img
                    src={item.gambar || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    {item.kategori || 'Umum'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.tanggal || 'Kabar Terbaru'}</span>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onOpenReadBerita(item)}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2 mb-3 cursor-pointer"
                  >
                    {item.judul}
                  </h3>

                  {/* Excerpt */}
                  <p
                    onClick={() => onOpenReadBerita(item)}
                    className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-5 leading-relaxed flex-1 cursor-pointer"
                  >
                    {item.ringkasan || (item.konten ? item.konten.substring(0, 110) + '...' : '')}
                  </p>

                  {/* Read Link */}
                  <button
                    onClick={() => onOpenReadBerita(item)}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-amber-600 transition-all group-hover:gap-2.5 self-start"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Direct Admin Card Actions */}
                  {adminSession && (
                    <div className="flex gap-2 pt-4 mt-4 border-t border-dashed border-slate-200">
                      <button
                        onClick={() => onOpenEditBerita(item)}
                        className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Berita
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus berita "${item.judul}"?`)) {
                            deleteBerita(item.id);
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              Belum ada berita yang dipublikasikan.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
