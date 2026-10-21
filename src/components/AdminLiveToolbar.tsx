import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import {
  Edit3,
  Save,
  Plus,
  LayoutDashboard,
  Settings,
  LogOut,
  AlertTriangle,
  Sparkles,
  Rocket
} from 'lucide-react';

interface AdminLiveToolbarProps {
  onOpenAddBerita: () => void;
  onOpenAddProgram: () => void;
  onOpenAddGaleri: () => void;
  onOpenAddPengurus: () => void;
  onOpenAddBank: () => void;
  onOpenAiBerita?: () => void;
  onOpenDeployGuide?: () => void;
}

export const AdminLiveToolbar: React.FC<AdminLiveToolbarProps> = ({
  onOpenAddBerita,
  onOpenAddProgram,
  onOpenAddGaleri,
  onOpenAddPengurus,
  onOpenAddBank,
  onOpenAiBerita,
  onOpenDeployGuide
}) => {
  const {
    adminSession,
    directEditMode,
    unsavedKeys,
    toggleDirectEditMode,
    saveAllDirectChanges,
    dismissUnsavedChanges,
    setActiveView,
    setDashboardTab,
    logoutAdmin
  } = useFoundation();

  if (!adminSession) return null;

  return (
    <>
      {/* Sticky top toolbar */}
      <div className="sticky top-0 z-[1000] bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 text-white px-4 py-2 shadow-xl border-b-2 border-amber-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left info & direct edit toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Admin: <strong className="text-white">{adminSession.user.nama}</strong> ({adminSession.user.role})
              </span>
            </div>

            <button
              onClick={toggleDirectEditMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                directEditMode
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Langsung: <strong>{directEditMode ? 'AKTIF' : 'NONAKTIF'}</strong></span>
            </button>

            {unsavedKeys.length > 0 && (
              <button
                onClick={saveAllDirectChanges}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/40 animate-pulse transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan ({unsavedKeys.length})</span>
              </button>
            )}
          </div>

          {/* Right action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onOpenAiBerita && (
              <button
                onClick={onOpenAiBerita}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500/30 hover:bg-teal-500 text-teal-200 hover:text-white border border-teal-400/40 text-xs font-bold transition-all shadow-sm"
                title="Tulis berita otomatis dengan AI Gemini"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Berita
              </button>
            )}
            <button
              onClick={onOpenAddBerita}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Berita
            </button>
            <button
              onClick={onOpenAddProgram}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Program
            </button>
            <button
              onClick={onOpenAddGaleri}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Galeri
            </button>
            <button
              onClick={onOpenAddPengurus}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Pengurus
            </button>
            <button
              onClick={onOpenAddBank}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Rekening
            </button>

            <button
              onClick={() => {
                setDashboardTab('konten');
                setActiveView('dashboard');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow transition-all"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Halaman
            </button>

            <button
              onClick={() => {
                setDashboardTab('overview');
                setActiveView('dashboard');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>

            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-medium transition-colors"
              title="Keluar dari mode admin"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Floating Save Alert if there are unsaved inline changes */}
      {unsavedKeys.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[9990] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-l-4 border-amber-500 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-md">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm text-amber-300">
              {unsavedKeys.length} Perubahan Teks Terdeteksi!
            </p>
            <p className="text-slate-300 mt-0.5">
              Anda telah mengedit teks langsung di halaman. Simpan ke database?
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={saveAllDirectChanges}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all"
            >
              Simpan
            </button>
            <button
              onClick={dismissUnsavedChanges}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
