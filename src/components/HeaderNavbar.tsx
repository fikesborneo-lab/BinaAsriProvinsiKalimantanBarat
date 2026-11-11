import React, { useState, useEffect } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { Menu, X, MessageSquare } from 'lucide-react';

interface HeaderNavbarProps {
  onOpenAdminLogin: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ onOpenAdminLogin }) => {
  const { kontenWeb, adminSession, setActiveView } = useFoundation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [lastTap, setLastTap] = useState(0);

  const handleLogoDoubleClick = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (adminSession) {
      setActiveView('dashboard');
    } else {
      onOpenAdminLogin();
    }
  };

  const handleLogoTouchEnd = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 350 && tapLength > 0) {
      e.preventDefault();
      handleLogoDoubleClick(e);
    }
    setLastTap(currentTime);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'profil', 'program', 'berita', 'galeri', 'pengurus', 'kontak'];
      const scrollY = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div
            onClick={() => scrollTo('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <img
              src={kontenWeb.logo_persegi || kontenWeb.logo_bulat}
              alt="Logo Yayasan Bina Asri"
              onDoubleClick={handleLogoDoubleClick}
              onTouchEnd={handleLogoTouchEnd}
              className="w-13 h-13 object-contain rounded-xl p-1 bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform cursor-pointer select-none"
              title="Klik untuk ke Beranda, Klik 2x untuk Portal Admin"
            />
            <div className="flex flex-col">
              <EditableText
                contentKey="brand_name"
                as="h1"
                className="text-lg sm:text-xl font-extrabold text-emerald-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors"
              />
              <EditableText
                contentKey="brand_sub"
                as="p"
                className="text-[11px] font-bold text-slate-500 tracking-wider uppercase"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => scrollTo('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'home'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => scrollTo('profil')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'profil'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => scrollTo('program')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'program'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Program
            </button>
            <button
              onClick={() => scrollTo('berita')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'berita'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Berita
            </button>
            <button
              onClick={() => scrollTo('galeri')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'galeri'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Galeri
            </button>
            <button
              onClick={() => scrollTo('pengurus')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'pengurus'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Cabang & Pengurus
            </button>
            <button
              onClick={() => scrollTo('kontak')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSection === 'kontak'
                  ? 'text-emerald-800 bg-emerald-50 font-bold'
                  : 'text-slate-700 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Kontak
            </button>

            {/* Hubungi Kami CTA */}
            <button
              onClick={() => scrollTo('kontak')}
              className="ml-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>Hubungi Kami</span>
            </button>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => scrollTo('kontak')}
              className="px-3.5 py-2 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kontak</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-emerald-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-4 space-y-1.5">
            <button
              onClick={() => scrollTo('home')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollTo('profil')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Profil & Visi Misi
            </button>
            <button
              onClick={() => scrollTo('program')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Program Kerja
            </button>
            <button
              onClick={() => scrollTo('berita')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Kabar Berita
            </button>
            <button
              onClick={() => scrollTo('galeri')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Galeri Dokumentasi
            </button>
            <button
              onClick={() => scrollTo('pengurus')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Cabang & Susunan Pengurus
            </button>
            <button
              onClick={() => scrollTo('kontak')}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
            >
              Kontak & Narahubung
            </button>
            <button
              onClick={() => scrollTo('kontak')}
              className="w-full text-center px-4 py-3 mt-2 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-md"
            >
              Hubungi Sekretariat Yayasan
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
