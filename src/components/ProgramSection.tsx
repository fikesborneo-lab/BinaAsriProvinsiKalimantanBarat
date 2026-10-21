import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { ProgramItem } from '../types';
import { Heart, Plus, Edit2, Trash2, Activity } from 'lucide-react';

interface ProgramSectionProps {
  onOpenAddProgram: () => void;
  onOpenEditProgram: (program: ProgramItem) => void;
  onOpenEditSectionHeader: (prefix: 'program' | 'berita' | 'galeri' | 'pengurus') => void;
  onOpenTbcScreening?: () => void;
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({
  onOpenAddProgram,
  onOpenEditProgram,
  onOpenEditSectionHeader,
  onOpenTbcScreening
}) => {
  const { program, deleteProgram, adminSession } = useFoundation();
  const [activeFilter, setActiveFilter] = useState<string>('Semua');

  const filters = [
    { label: 'Semua Program', value: 'Semua' },
    { label: 'Investigasi & Skrining', value: 'Investigasi' },
    { label: 'Pendampingan Pasien', value: 'Pendampingan' },
    { label: 'Kader Komunitas', value: 'Kader' },
    { label: 'Jejaring Faskes DPPM', value: 'Advokasi' }
  ];

  const filteredPrograms = program.filter((p) => {
    if (activeFilter === 'Semua') return true;
    const combined = `${p.nama} ${p.deskripsi}`.toLowerCase();
    return combined.includes(activeFilter.toLowerCase());
  });

  const scrollToDonasi = () => {
    const el = document.getElementById('donasi');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="program" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold tracking-wider uppercase mb-3">
            <EditableText contentKey="program_tag" as="span" />
          </div>
          <EditableText
            contentKey="program_title"
            as="h2"
            className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-4"
          />
          <EditableText
            contentKey="program_desc"
            as="p"
            multiline
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          />

          {adminSession && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => onOpenEditSectionHeader('program')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Judul Program</span>
              </button>
              <button
                onClick={onOpenAddProgram}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Program Baru</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === f.value
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col group"
              >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 group-hover:from-emerald-700 group-hover:to-emerald-600 transition-colors">
                  <h4 className="font-bold text-base sm:text-lg leading-snug line-clamp-2">
                    {item.nama}
                  </h4>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed flex-1">
                    {item.deskripsi}
                  </p>

                  {/* Target meta */}
                  <div className="bg-slate-50 p-3 rounded-xl mb-4 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Target Capaian:</span>
                    <span className="font-extrabold text-emerald-800">{item.target || '-'}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-amber-500 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, item.progress || 0))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Progres Penyaluran</span>
                      <span className="text-emerald-800 font-extrabold">{item.progress || 0}%</span>
                    </div>
                  </div>

                  {/* Support CTA & Skrining CTA */}
                  <div className="space-y-2">
                    {onOpenTbcScreening && item.nama.toLowerCase().includes('skrining') && (
                      <button
                        onClick={onOpenTbcScreening}
                        className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Activity className="w-3.5 h-3.5 text-teal-200" />
                        <span>Mulai Skrining TBC Mandiri</span>
                      </button>
                    )}
                    <button
                      onClick={scrollToDonasi}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>Dukung Program Ini</span>
                    </button>
                  </div>

                  {/* Direct Admin Card Actions */}
                  {adminSession && (
                    <div className="flex gap-2 pt-3 mt-3 border-t border-dashed border-slate-200">
                      <button
                        onClick={() => onOpenEditProgram(item)}
                        className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus program "${item.nama}"?`)) {
                            deleteProgram(item.id);
                          }
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
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
              Belum ada program untuk kategori ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
