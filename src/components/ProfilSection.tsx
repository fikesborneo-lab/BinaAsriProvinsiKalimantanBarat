import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { Award, Target, Sparkles, CheckCircle2, Edit2 } from 'lucide-react';

interface ProfilSectionProps {
  onOpenEditProfil: () => void;
}

export const ProfilSection: React.FC<ProfilSectionProps> = ({ onOpenEditProfil }) => {
  const { kontenWeb, adminSession } = useFoundation();

  const misiItems = (kontenWeb.misi_items || '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <section id="profil" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Admin Edit */}
        {adminSession && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onOpenEditProfil}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profil, Foto & Visi Misi</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Media & Legal Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={kontenWeb.profil_img || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800'}
                alt="Kegiatan Yayasan Bina Asri"
                className="w-full h-[400px] sm:h-[460px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent"></div>
            </div>

            {/* Floating Registration Badge */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border-l-4 border-amber-500 flex items-center gap-3.5 max-w-[320px] sm:max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <strong className="block text-sm font-extrabold text-emerald-900 leading-tight">
                  Lembaga Terdaftar Resmi
                </strong>
                <EditableText
                  contentKey="profil_legal"
                  as="span"
                  className="text-slate-500 font-medium text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Right: Text & Visi Misi */}
          <div className="lg:col-span-7 pt-6 lg:pt-0">
            <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold tracking-wider uppercase mb-3">
              <EditableText contentKey="profil_tag" as="span" />
            </div>

            <EditableText
              contentKey="profil_title"
              as="h2"
              className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight mb-5"
            />

            <EditableText
              contentKey="profil_p1"
              as="p"
              multiline
              className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4 text-justify"
            />

            <EditableText
              contentKey="profil_p2"
              as="p"
              multiline
              className="text-slate-600 leading-relaxed text-sm sm:text-base mb-8 text-justify"
            />

            {/* Visi & Misi Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-emerald-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-emerald-800">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <EditableText contentKey="visi_title" as="h4" className="font-bold text-sm sm:text-base" />
                </div>
                <EditableText
                  contentKey="visi_text"
                  as="p"
                  multiline
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                />
              </div>

              {/* Misi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 text-emerald-800">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <EditableText contentKey="misi_title" as="h4" className="font-bold text-sm sm:text-base" />
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                  {misiItems.length > 0 ? (
                    misiItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Menyelenggarakan program filantropi dan pendidikan yatim dhuafa.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
