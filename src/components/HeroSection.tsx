import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { Heart, BookOpen, MessageCircle, Edit2, Activity } from 'lucide-react';
import { ScrollReveal } from './common/ScrollReveal';

interface HeroSectionProps {
  onOpenEditHero: () => void;
  onOpenAdminLogin?: () => void;
  onOpenTbcScreening?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenEditHero, onOpenAdminLogin, onOpenTbcScreening }) => {
  const { kontenWeb, adminSession, setActiveView } = useFoundation();
  const [lastTap, setLastTap] = React.useState(0);

  const handleLogoDoubleClick = () => {
    if (adminSession) {
      setActiveView('dashboard');
    } else if (onOpenAdminLogin) {
      onOpenAdminLogin();
    }
  };

  const handleLogoTouchEnd = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 350 && tapLength > 0) {
      e.preventDefault();
      handleLogoDoubleClick();
    }
    setLastTap(currentTime);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative text-white py-20 sm:py-28 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 60, 20, 0.95), rgba(30, 95, 35, 0.92)), url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1600')`,
      }}
    >
      {/* Decorative slant bottom divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 bg-slate-50"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
      ></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge & Quick Admin Edit */}
        <ScrollReveal direction="down" duration={0.5}>
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-200 text-xs sm:text-sm font-bold tracking-wide shadow-sm">
              <span>✨</span>
              <EditableText contentKey="hero_badge" as="span" />
            </div>

            {adminSession && (
              <button
                onClick={onOpenEditHero}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/90 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Hero & Logo</span>
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* Center Floating Logo (Klik 2x untuk Admin) */}
        <ScrollReveal direction="zoom" delay={0.1} duration={0.6}>
          <div className="relative inline-block mb-6 select-none cursor-pointer">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
            <img
              src={kontenWeb.logo_bulat || 'https://lh3.googleusercontent.com/d/1t_el0P4aHM3gLG4RTDrupVAjYTIaMqMZ'}
              alt="Lambang Yayasan Bina Asri"
              onDoubleClick={handleLogoDoubleClick}
              onTouchEnd={handleLogoTouchEnd}
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-2xl animate-float relative z-10 hover:scale-105 transition-transform"
              title="Klik 2x untuk Portal Admin"
            />
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal direction="up" delay={0.2} duration={0.6}>
          <EditableText
            contentKey="hero_title"
            as="h1"
            className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5 max-w-4xl mx-auto drop-shadow-sm"
          />
        </ScrollReveal>

        {/* Description */}
        <ScrollReveal direction="up" delay={0.3} duration={0.6}>
          <EditableText
            contentKey="hero_desc"
            as="p"
            multiline
            className="text-base sm:text-lg text-emerald-100 max-w-3xl mx-auto mb-10 leading-relaxed font-normal opacity-95"
          />
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal direction="up" delay={0.4} duration={0.6}>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 relative z-20">
            <button
              onClick={() => scrollTo('donasi')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>{kontenWeb.hero_cta_donasi || 'Salurkan Donasi'}</span>
            </button>

            <button
              onClick={() => scrollTo('program')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-emerald-950 backdrop-blur-md border border-white/30 font-bold text-sm sm:text-base transition-all hover:shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              <span>{kontenWeb.hero_cta_program || 'Jelajahi Program'}</span>
            </button>

            {onOpenTbcScreening && (
              <button
                onClick={onOpenTbcScreening}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-teal-500/30 hover:bg-teal-500 text-teal-100 hover:text-white backdrop-blur-md border border-teal-300/40 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
              >
                <Activity className="w-4 h-4 text-teal-300 animate-pulse" />
                <span>Skrining Gejala TBC</span>
              </button>
            )}

            <button
              onClick={() => scrollTo('kontak')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 font-bold text-sm sm:text-base transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{kontenWeb.hero_cta_kontak || 'Hubungi Kami'}</span>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
