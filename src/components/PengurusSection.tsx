import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { PengurusItem } from '../types';
import { DAFTAR_CABANG_DAERAH } from '../data/defaultData';
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Users,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

interface PengurusSectionProps {
  onOpenAddPengurus: (defaultCabang?: string) => void;
  onOpenEditPengurus: (item: PengurusItem) => void;
  onOpenEditSectionHeader: (prefix: 'program' | 'berita' | 'galeri' | 'pengurus') => void;
}

export const PengurusSection: React.FC<PengurusSectionProps> = ({
  onOpenAddPengurus,
  onOpenEditPengurus,
  onOpenEditSectionHeader
}) => {
  const { pengurus, deletePengurus, adminSession } = useFoundation();
  const [selectedCabang, setSelectedCabang] = useState<string>('Semua');

  // Filtered list
  const filteredPengurus = pengurus.filter((p) => {
    if (selectedCabang === 'Semua') return true;
    return (p.cabang || 'Pusat / SR Kalbar') === selectedCabang;
  });

  // Find info for currently selected branch
  const activeCabangInfo = DAFTAR_CABANG_DAERAH.find((c) => c.nama === selectedCabang);

  return (
    <section id="pengurus" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold tracking-wider uppercase mb-3">
            <EditableText contentKey="pengurus_tag" as="span" />
          </div>
          <EditableText
            contentKey="pengurus_title"
            as="h2"
            className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-4"
          />
          <EditableText
            contentKey="pengurus_desc"
            as="p"
            multiline
            className="text-slate-600 text-sm sm:text-base leading-relaxed"
          />

          {adminSession && (
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <button
                onClick={() => onOpenEditSectionHeader('pengurus')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Judul Pengurus</span>
              </button>
              <button
                onClick={() => onOpenAddPengurus(selectedCabang !== 'Semua' ? selectedCabang : 'Kota Pontianak')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pengurus {selectedCabang !== 'Semua' ? `(${selectedCabang})` : ''}</span>
              </button>
            </div>
          )}
        </div>

        {/* Cabang Daerah Filter Tabs */}
        <div className="mb-8 bg-slate-100/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 px-1">
            <span className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Pilih Cabang Daerah:</span>
            </span>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              8 Cabang Kabupaten & Kota se-Kalbar + Pengurus Pusat
            </span>
          </div>

          {/* Full Wrap Button Grid: All buttons are completely visible */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setSelectedCabang('Semua')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                selectedCabang === 'Semua'
                  ? 'bg-emerald-950 text-white shadow-md ring-2 ring-emerald-700/60'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
              }`}
            >
              <span>Semua Wilayah</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                selectedCabang === 'Semua' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {pengurus.length}
              </span>
            </button>

            {DAFTAR_CABANG_DAERAH.map((c) => {
              const count = pengurus.filter((p) => (p.cabang || 'Pusat / SR Kalbar') === c.nama).length;
              const isSelected = selectedCabang === c.nama;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCabang(c.nama)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/60'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200'
                  }`}
                >
                  <span>{c.nama}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Branch Detail Info Banner (if a specific branch is chosen) */}
        {activeCabangInfo && (
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 mb-8 shadow-md border border-emerald-800/60 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wide">
                  <span>Kantor Cabang Resmi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Yayasan Bina Asri — {activeCabangInfo.nama}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                  {activeCabangInfo.keterangan}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 text-xs text-emerald-100 shrink-0 bg-white/10 p-3.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-[11px] leading-tight">{activeCabangInfo.alamat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-white text-[11px]">{activeCabangInfo.telepon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="font-semibold text-emerald-200 text-[11px]">{activeCabangInfo.jumlahBinaan}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Board Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPengurus.length > 0 ? (
            filteredPengurus.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col items-center group relative overflow-hidden"
              >
                {/* Branch Badge on top */}
                <span className="absolute top-3.5 right-3.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {item.cabang || 'Pusat'}
                </span>

                {/* Avatar with gradient border */}
                <div className="relative my-3">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <img
                      src={item.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                      alt={item.nama}
                      className="w-full h-full rounded-full object-cover bg-slate-50"
                      loading="lazy"
                    />
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-900 text-base leading-snug mb-1">
                  {item.nama}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-2">
                  {item.jabatan}
                </p>

                {item.kontak && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-3">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{item.kontak}</span>
                  </div>
                )}

                {/* Direct Admin Card Actions */}
                {adminSession && (
                  <div className="w-full flex gap-2 pt-3 border-t border-dashed border-slate-200 mt-auto">
                    <button
                      onClick={() => onOpenEditPengurus(item)}
                      className="flex-1 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus pengurus "${item.nama}" dari cabang "${item.cabang}"?`)) {
                          deletePengurus(item.id);
                        }
                      }}
                      className="py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Hapus Pengurus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-bold text-sm text-slate-700 mb-1">
                Belum ada pengurus terdaftar untuk {selectedCabang}.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Anda dapat menambahkan susunan pengurus untuk cabang ini melalui tombol di bawah.
              </p>
              {adminSession && (
                <button
                  onClick={() => onOpenAddPengurus(selectedCabang !== 'Semua' ? selectedCabang : 'Kota Pontianak')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Pengurus Cabang
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
