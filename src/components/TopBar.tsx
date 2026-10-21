import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { MapPin, Mail, Phone, Lock, Settings, Edit2 } from 'lucide-react';

interface TopBarProps {
  onOpenAdminLogin: () => void;
  onOpenEditKontak: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenAdminLogin, onOpenEditKontak }) => {
  const { adminSession, setActiveView } = useFoundation();

  return (
    <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-emerald-100 text-xs py-2 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2.5">
        {/* Contact Info */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <EditableText contentKey="top_address" as="span" />
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <EditableText contentKey="top_email" as="span" />
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <EditableText contentKey="top_phone" as="span" />
          </div>
        </div>

        {/* Admin Action Buttons (Hanya muncul jika sudah login admin) */}
        {adminSession && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEditKontak}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-[11px] font-semibold transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Kontak Topbar</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-amber-500 hover:text-slate-900 text-white font-semibold text-[11px] transition-all shadow-sm"
            >
              <Settings className="w-3 h-3" />
              <span>Panel Admin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
