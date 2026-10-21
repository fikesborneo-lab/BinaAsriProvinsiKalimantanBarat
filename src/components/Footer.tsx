import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { Lock, Settings, Edit2 } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
  onOpenEditFooter: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin, onOpenEditFooter }) => {
  const { kontenWeb, adminSession, setActiveView } = useFoundation();
  const currentYear = new Date().getFullYear();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t-4 border-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {adminSession && (
          <div className="flex justify-end mb-4">
            <button
              onClick={onOpenEditFooter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Teks Footer & Legalitas</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Col 1: Identity & Legal */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={kontenWeb.logo_persegi || kontenWeb.logo_bulat}
                alt="Logo Yayasan Bina Asri"
                className="w-12 h-12 rounded-xl object-contain bg-white p-1 cursor-pointer hover:opacity-90 transition-opacity select-none"
                onDoubleClick={() => {
                  if (adminSession) {
                    setActiveView('dashboard');
                  } else {
                    onOpenAdminLogin();
                  }
                }}
              />
              <div>
                <EditableText
                  contentKey="brand_name"
                  as="h4"
                  className="font-extrabold text-white text-base leading-tight"
                />
                <EditableText
                  contentKey="brand_sub"
                  as="p"
                  className="text-[11px] font-bold text-slate-500 tracking-wider uppercase"
                />
              </div>
            </div>

            <EditableText
              contentKey="footer_desc"
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-400 leading-relaxed"
            />

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono leading-relaxed">
              <EditableText contentKey="footer_legal" as="p" multiline />
            </div>
          </div>

          {/* Col 2: Tautan Cepat */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Tautan Cepat
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollTo('home')} className="hover:text-amber-400 transition-colors">
                  Beranda
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('profil')} className="hover:text-amber-400 transition-colors">
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('program')} className="hover:text-amber-400 transition-colors">
                  Program Kerja
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('berita')} className="hover:text-amber-400 transition-colors">
                  Kabar Berita
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('galeri')} className="hover:text-amber-400 transition-colors">
                  Galeri Foto
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pengurus')} className="hover:text-amber-400 transition-colors">
                  Cabang & Pengurus
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Program */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Program Kami
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollTo('program')} className="hover:text-amber-400 transition-colors">
                  Beasiswa Yatim
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('program')} className="hover:text-amber-400 transition-colors">
                  Sembako Dhuafa
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('program')} className="hover:text-amber-400 transition-colors">
                  Pengobatan Medis
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('program')} className="hover:text-amber-400 transition-colors">
                  Pemberdayaan UMKM
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('donasi')} className="hover:text-amber-400 transition-colors">
                  Infaq & Sedekah
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Sekretariat */}
          <div className="lg:col-span-3 space-y-3 text-xs sm:text-sm">
            <h5 className="text-white font-extrabold text-sm uppercase tracking-wider">
              Sekretariat
            </h5>
            <p className="text-slate-400 leading-relaxed">
              {kontenWeb.kontak_alamat}
            </p>
            <p className="text-slate-400">
              Telp: {kontenWeb.kontak_telepon}
            </p>
            <p className="text-emerald-400 font-semibold">
              WhatsApp: +{kontenWeb.wa_number}
            </p>

            {adminSession && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Panel Manajemen Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {currentYear}{' '}
            <EditableText contentKey="footer_copyright" as="span" />
          </div>

          <div className="text-[11px] text-slate-400">
            Amanah, Transparan, & Melayani Sepenuh Hati
          </div>
        </div>
      </div>
    </footer>
  );
};
