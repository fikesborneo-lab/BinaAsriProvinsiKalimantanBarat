import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { BeritaItem, ProgramItem, PengurusItem, BankAccount, KontenWeb } from '../types';
import { DAFTAR_CABANG_DAERAH } from '../data/defaultData.ts';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Target,
  Image,
  Users,
  Inbox,
  CreditCard,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  Globe,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Save,
  MessageSquare,
  Database,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  FileSpreadsheet,
  HardDrive,
  Cloud,
  Sparkles,
  Rocket
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initGoogleAuth,
  signInWithGoogle,
  googleSignOut,
  getGoogleAccessToken,
  SCOPES as GOOGLE_SCOPES,
} from '../lib/googleAuth.ts';
import {
  backupToGoogleDrive,
  exportToGoogleSheets,
} from '../lib/googleBackup.ts';

interface AdminDashboardProps {
  onOpenAddBerita: () => void;
  onOpenEditBerita: (item: BeritaItem) => void;
  onOpenAddProgram: () => void;
  onOpenEditProgram: (item: ProgramItem) => void;
  onOpenAddGaleri: () => void;
  onOpenAddPengurus: (defaultCabang?: string) => void;
  onOpenEditPengurus: (item: PengurusItem) => void;
  onOpenAddBank: () => void;
  onOpenEditBank: (item: BankAccount) => void;
  onOpenAiBerita?: () => void;
  onOpenDeployGuide?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenAddBerita,
  onOpenEditBerita,
  onOpenAddProgram,
  onOpenEditProgram,
  onOpenAddGaleri,
  onOpenAddPengurus,
  onOpenEditPengurus,
  onOpenAddBank,
  onOpenEditBank,
  onOpenAiBerita,
  onOpenDeployGuide
}) => {
  const {
    kontenWeb,
    berita,
    program,
    galeri,
    pengurus,
    banks,
    pesan,
    adminSession,
    dashboardTab,
    setDashboardTab,
    setActiveView,
    logoutAdmin,
    deleteBerita,
    deleteProgram,
    deleteGaleri,
    deletePengurus,
    deleteBank,
    deletePesan,
    saveFullKonten,
    changeAdminPassword,
    exportDataJson,
    importDataJson,
    resetToDefaults,
    showToast
  } = useFoundation();

  // Local state for "Edit Semua Konten" form
  const [formData, setFormData] = useState<KontenWeb>({ ...kontenWeb });
  const [adminCabangFilter, setAdminCabangFilter] = useState<string>('Semua');

  // Password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Supabase state
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    isConfigured: boolean;
    connected: boolean;
    message: string;
    url?: string;
    tableCounts?: Record<string, number>;
  } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Google Workspace auth & backup state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [isDriveBackingUp, setIsDriveBackingUp] = useState(false);
  const [isSheetsExporting, setIsSheetsExporting] = useState(false);
  const [driveResult, setDriveResult] = useState<{ url: string; name: string } | null>(null);
  const [sheetsResult, setSheetsResult] = useState<{ url: string; title: string } | null>(null);

  React.useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    try {
      const res = await signInWithGoogle();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);
      showToast(`Berhasil login Google sebagai ${res.user.displayName || res.user.email}!`, 'success');
    } catch (err: any) {
      showToast('Gagal menghubungkan akun Google: ' + (err.message || 'Dibatalkan'), 'error');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setGoogleToken(null);
    showToast('Akun Google berhasil diputuskan.', 'info');
  };

  const handleBackupToDrive = async () => {
    const token = googleToken || (await getGoogleAccessToken());
    if (!token) {
      showToast('Harap hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }
    setIsDriveBackingUp(true);
    setDriveResult(null);
    try {
      const fullData = {
        kontenWeb,
        berita,
        program,
        galeri,
        pengurus,
        banks,
        pesan,
      };
      const res = await backupToGoogleDrive(token, fullData);
      if (res.success && res.webViewLink) {
        setDriveResult({ url: res.webViewLink, name: res.fileName || 'backup.json' });
        showToast('Cadangan database berhasil disimpan ke Google Drive!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Gagal mencadangkan ke Google Drive.', 'error');
    } finally {
      setIsDriveBackingUp(false);
    }
  };

  const handleExportToSheets = async () => {
    const token = googleToken || (await getGoogleAccessToken());
    if (!token) {
      showToast('Harap hubungkan akun Google terlebih dahulu.', 'error');
      return;
    }
    setIsSheetsExporting(true);
    setSheetsResult(null);
    try {
      const fullData = {
        kontenWeb,
        berita,
        program,
        galeri,
        pengurus,
        banks,
        pesan,
      };
      const res = await exportToGoogleSheets(token, fullData);
      if (res.success && res.spreadsheetUrl) {
        setSheetsResult({ url: res.spreadsheetUrl, title: `Database Yayasan Bina Asri Kalbar` });
        showToast('Seluruh tabel berhasil diekspor ke Google Sheets!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast('Gagal mengekspor data ke Google Sheets.', 'error');
    } finally {
      setIsSheetsExporting(false);
    }
  };

  // Import JSON file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchSupabaseStatus = async () => {
    setSupabaseStatus((prev) => ({
      loading: true,
      isConfigured: prev?.isConfigured ?? false,
      connected: prev?.connected ?? false,
      message: 'Memeriksa status koneksi Supabase...',
      url: prev?.url ?? '',
      tableCounts: prev?.tableCounts ?? {},
    }));
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus({
        loading: false,
        isConfigured: Boolean(data.isConfigured),
        connected: Boolean(data.connected),
        message: data.message || 'Status Supabase dicek.',
        url: data.url || '',
        tableCounts: data.tableCounts || {},
      });
    } catch (err: any) {
      setSupabaseStatus({
        loading: false,
        isConfigured: false,
        connected: false,
        message: 'Gagal memeriksa koneksi ke server.',
      });
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchSupabaseStatus();
      } else {
        showToast(data.message || 'Gagal sinkronisasi data ke Supabase.', 'error');
      }
    } catch (err: any) {
      showToast('Gagal menghubungi endpoint sinkronisasi.', 'error');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'konten', label: 'Edit Semua Halaman', icon: <FileText className="w-4 h-4" /> },
    { id: 'berita', label: `Berita (${berita.length})`, icon: <Newspaper className="w-4 h-4" /> },
    { id: 'program', label: `Program (${program.length})`, icon: <Target className="w-4 h-4" /> },
    { id: 'galeri', label: `Galeri (${galeri.length})`, icon: <Image className="w-4 h-4" /> },
    { id: 'pengurus', label: `Pengurus (${pengurus.length})`, icon: <Users className="w-4 h-4" /> },
    { id: 'banks', label: `Rekening (${banks.length})`, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'pesan', label: `Pesan (${pesan.length})`, icon: <Inbox className="w-4 h-4" /> },
    { id: 'supabase', label: 'Database Supabase', icon: <Database className="w-4 h-4 text-emerald-600" /> },
    { id: 'pengaturan', label: 'Akun & Sandi', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'backup', label: 'Cadangkan / Pulihkan', icon: <Download className="w-4 h-4" /> }
  ];

  const handleSaveAllKonten = (e: React.FormEvent) => {
    e.preventDefault();
    saveFullKonten(formData);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast('Konfirmasi password baru tidak cocok!', 'error');
      return;
    }
    const res = await changeAdminPassword(oldPass, newPass);
    if (res.success) {
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_bina_asri_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File cadangan database berhasil diunduh!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const updateField = (key: keyof KontenWeb, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Admin Navbar */}
      <nav className="bg-slate-900 text-white px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={kontenWeb.logo_persegi || kontenWeb.logo_bulat}
              alt="Logo"
              className="w-10 h-10 rounded-lg p-1 bg-white object-contain"
            />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Panel Manajemen Yayasan Bina Asri
              </h2>
              <p className="text-[11px] text-slate-400">
                Halo, <b className="text-white">{adminSession?.user.nama}</b> ({adminSession?.user.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDeployGuide && (
              <button
                onClick={onOpenDeployGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow transition-colors"
                title="Panduan ekspor ke GitHub & deploy ke Vercel"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-300" />
                <span>Panduan Deploy</span>
              </button>
            )}
            <button
              onClick={() => setActiveView('public')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Lihat Web Publik</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
        {/* Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-6 flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashboardTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                dashboardTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {dashboardTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{berita.length}</h4>
                  <span className="text-xs font-semibold text-slate-500">Berita Terbit</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{program.length}</h4>
                  <span className="text-xs font-semibold text-slate-500">Program Aktif</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{galeri.length}</h4>
                  <span className="text-xs font-semibold text-slate-500">Foto Galeri</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-none mb-1">{pesan.length}</h4>
                  <span className="text-xs font-semibold text-slate-500">Pesan Masuk</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
                <span>⚡ Aksi Cepat Pengelolaan</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setDashboardTab('konten')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 shadow"
                >
                  <FileText className="w-4 h-4" /> Edit Konten Halaman
                </button>
                {onOpenAiBerita && (
                  <button
                    onClick={onOpenAiBerita}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> Tulis Berita (AI)
                  </button>
                )}
                {onOpenDeployGuide && (
                  <button
                    onClick={onOpenDeployGuide}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Rocket className="w-4 h-4 text-amber-400" /> Panduan Deploy
                  </button>
                )}
                <button
                  onClick={onOpenAddBerita}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Tulis Berita
                </button>
                <button
                  onClick={onOpenAddProgram}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Buat Program
                </button>
                <button
                  onClick={onOpenAddGaleri}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Tambah Foto
                </button>
                <button
                  onClick={() => onOpenAddPengurus()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Tambah Pengurus
                </button>
                <button
                  onClick={onOpenAddBank}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Tambah Rekening
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EDIT SEMUA HALAMAN */}
        {dashboardTab === 'konten' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-emerald-950">
                  📄 Pengaturan & Edit Semua Konten Halaman
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah teks judul, narasi, logo, nomor rekening, alamat, dan nomor kontak di seluruh website.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveAllKonten}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Konten</span>
              </button>
            </div>

            <form onSubmit={handleSaveAllKonten} className="space-y-6">
              {/* 1. Identitas Yayasan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>🏛️ 1. Identitas Yayasan & Logo</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Yayasan</label>
                    <input
                      type="text"
                      value={formData.brand_name || ''}
                      onChange={(e) => updateField('brand_name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Nama / Provinsi</label>
                    <input
                      type="text"
                      value={formData.brand_sub || ''}
                      onChange={(e) => updateField('brand_sub', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL Logo Persegi (Navbar & Footer)</label>
                    <input
                      type="url"
                      value={formData.logo_persegi || ''}
                      onChange={(e) => updateField('logo_persegi', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL Logo Bulat (Hero Center)</label>
                    <input
                      type="url"
                      value={formData.logo_bulat || ''}
                      onChange={(e) => updateField('logo_bulat', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Topbar Kontak */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>📍 2. Kontak Header / Topbar</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Singkat Topbar</label>
                    <input
                      type="text"
                      value={formData.top_address || ''}
                      onChange={(e) => updateField('top_address', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Topbar</label>
                    <input
                      type="text"
                      value={formData.top_email || ''}
                      onChange={(e) => updateField('top_email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telepon Topbar</label>
                    <input
                      type="text"
                      value={formData.top_phone || ''}
                      onChange={(e) => updateField('top_phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Hero Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>🌟 3. Beranda & Hero Banner</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tagline Hero</label>
                  <input
                    type="text"
                    value={formData.hero_badge || ''}
                    onChange={(e) => updateField('hero_badge', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Hero (H1)</label>
                  <input
                    type="text"
                    value={formData.hero_title || ''}
                    onChange={(e) => updateField('hero_title', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Hero</label>
                  <textarea
                    rows={3}
                    value={formData.hero_desc || ''}
                    onChange={(e) => updateField('hero_desc', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              {/* 4. Profil & Visi Misi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>📖 4. Profil, Tentang Kami, Visi & Misi</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tagline Profil</label>
                    <input
                      type="text"
                      value={formData.profil_tag || ''}
                      onChange={(e) => updateField('profil_tag', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Judul Profil</label>
                    <input
                      type="text"
                      value={formData.profil_title || ''}
                      onChange={(e) => updateField('profil_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto Kegiatan Profil</label>
                    <input
                      type="url"
                      value={formData.profil_img || ''}
                      onChange={(e) => updateField('profil_img', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Legalitas Kemenkumham RI</label>
                    <input
                      type="text"
                      value={formData.profil_legal || ''}
                      onChange={(e) => updateField('profil_legal', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 1</label>
                  <textarea
                    rows={3}
                    value={formData.profil_p1 || ''}
                    onChange={(e) => updateField('profil_p1', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 2</label>
                  <textarea
                    rows={3}
                    value={formData.profil_p2 || ''}
                    onChange={(e) => updateField('profil_p2', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teks Visi</label>
                    <textarea
                      rows={3}
                      value={formData.visi_text || ''}
                      onChange={(e) => updateField('visi_text', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Butir Misi (1 baris per poin)</label>
                    <textarea
                      rows={3}
                      value={formData.misi_items || ''}
                      onChange={(e) => updateField('misi_items', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Donasi Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>❤️ 5. Teks Halaman Donasi</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Donasi</label>
                  <input
                    type="text"
                    value={formData.donasi_title || ''}
                    onChange={(e) => updateField('donasi_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ajakan Donasi</label>
                  <textarea
                    rows={2}
                    value={formData.donasi_desc || ''}
                    onChange={(e) => updateField('donasi_desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poin Keunggulan (1 baris per poin)</label>
                  <textarea
                    rows={3}
                    value={formData.donasi_points || ''}
                    onChange={(e) => updateField('donasi_points', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              {/* 6. Kontak & Footer */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-emerald-900 border-b pb-2 flex items-center gap-2">
                  <span>📞 6. Kontak & Footer</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kantor Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.kontak_alamat || ''}
                    onChange={(e) => updateField('kontak_alamat', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telepon Teks</label>
                    <input
                      type="text"
                      value={formData.kontak_telepon || ''}
                      onChange={(e) => updateField('kontak_telepon', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Link (Hanya angka)</label>
                    <input
                      type="text"
                      value={formData.wa_number || ''}
                      onChange={(e) => updateField('wa_number', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                    <input
                      type="text"
                      value={formData.kontak_email || ''}
                      onChange={(e) => updateField('kontak_email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Legalitas & NPWP Footer</label>
                  <textarea
                    rows={2}
                    value={formData.footer_legal || ''}
                    onChange={(e) => updateField('footer_legal', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>Simpan Seluruh Perubahan Konten</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: KELOLA BERITA */}
        {dashboardTab === 'berita' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">📰 Daftar Berita & Artikel</h3>
                <p className="text-xs text-slate-500">Total {berita.length} berita terpublikasi</p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenAiBerita && (
                  <button
                    onClick={onOpenAiBerita}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tulis dengan AI</span>
                  </button>
                )}
                <button
                  onClick={onOpenAddBerita}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Tulis Berita Baru
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4 w-16">Foto</th>
                    <th className="py-3 px-4">Judul Berita</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {berita.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={b.gambar}
                          alt="thumb"
                          className="w-12 h-10 object-cover rounded-md bg-slate-100"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{b.judul}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                          {b.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{b.tanggal}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEditBerita(b)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus berita "${b.judul}"?`)) {
                                deleteBerita(b.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: KELOLA PROGRAM */}
        {dashboardTab === 'program' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">🎯 Daftar Program Kerja</h3>
                <p className="text-xs text-slate-500">Total {program.length} program kerja</p>
              </div>
              <button
                onClick={onOpenAddProgram}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Buat Program Baru
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4">Nama Program</th>
                    <th className="py-3 px-4">Target Capaian</th>
                    <th className="py-3 px-4">Progres Penyaluran</th>
                    <th className="py-3 px-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {program.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="block text-slate-900">{p.nama}</strong>
                        <span className="text-xs text-slate-500 line-clamp-1">{p.deskripsi}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">{p.target}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-xs">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEditProgram(p)}
                            className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus program "${p.nama}"?`)) {
                                deleteProgram(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: KELOLA GALERI */}
        {dashboardTab === 'galeri' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">🖼️ Galeri Foto Dokumentasi</h3>
                <p className="text-xs text-slate-500">Total {galeri.length} foto dokumentasi</p>
              </div>
              <button
                onClick={onOpenAddGaleri}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Tambah Foto Galeri
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {galeri.map((g) => (
                <div key={g.id} className="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 border">
                  <img src={g.gambar} alt={g.judul} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                    <p className="text-xs font-bold line-clamp-2">{g.judul}</p>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus foto "${g.judul}"?`)) {
                          deleteGaleri(g.id);
                        }
                      }}
                      className="self-end px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: KELOLA PENGURUS */}
        {dashboardTab === 'pengurus' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">👥 Susunan Pengurus Pusat & Cabang Daerah</h3>
                <p className="text-xs text-slate-500">Total {pengurus.length} jajaran pengurus di 8 cabang dan pusat</p>
              </div>
              <button
                onClick={() => onOpenAddPengurus(adminCabangFilter !== 'Semua' ? adminCabangFilter : 'Kota Pontianak')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Tambah Pengurus {adminCabangFilter !== 'Semua' ? `(${adminCabangFilter})` : ''}
              </button>
            </div>

            {/* Filter Cabang in Admin */}
            <div className="flex flex-wrap items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <button
                onClick={() => setAdminCabangFilter('Semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  adminCabangFilter === 'Semua'
                    ? 'bg-emerald-800 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Semua Wilayah ({pengurus.length})
              </button>
              {DAFTAR_CABANG_DAERAH.map((c) => {
                const count = pengurus.filter((p) => (p.cabang || 'Pusat / SR Kalbar') === c.nama).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setAdminCabangFilter(c.nama)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      adminCabangFilter === c.nama
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.nama} ({count})
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4 w-14">Foto</th>
                    <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Cabang Daerah</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengurus
                    .filter((p) => {
                      if (adminCabangFilter === 'Semua') return true;
                      return (p.cabang || 'Pusat / SR Kalbar') === adminCabangFilter;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <img
                            src={p.foto}
                            alt={p.nama}
                            className="w-10 h-10 object-cover rounded-full bg-slate-100"
                          />
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.nama}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-800">{p.jabatan}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-100 whitespace-nowrap">
                            {p.cabang || 'Pusat / Wilayah Kalbar'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {p.kontak || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenEditPengurus(p)}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus pengurus "${p.nama}"?`)) {
                                  deletePengurus(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: KELOLA REKENING */}
        {dashboardTab === 'banks' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">💳 Rekening Donasi Resmi</h3>
                <p className="text-xs text-slate-500">Kelola daftar rekening bank yang tampil di bagian donasi</p>
              </div>
              <button
                onClick={onOpenAddBank}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Tambah Rekening Bank
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {banks.map((b) => (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-emerald-900">{b.bank}</span>
                      <span className="text-[10px] uppercase font-bold bg-white px-2 py-0.5 rounded-full border">
                        {b.badge}
                      </span>
                    </div>
                    <div className="font-mono text-base font-bold text-slate-900 tracking-wider mb-0.5">
                      {b.norek}
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{b.an}</div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onOpenEditBank(b)}
                      className="flex-1 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus rekening "${b.bank}"?`)) deleteBank(b.id);
                      }}
                      className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: PESAN MASUK */}
        {dashboardTab === 'pesan' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h3 className="text-lg font-black text-slate-900">📩 Kotak Masuk Pesan Pengunjung</h3>
                <p className="text-xs text-slate-500">Pesan yang dikirimkan melalui formulir kontak publik</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengirim</th>
                    <th className="py-3 px-4">Kontak (WhatsApp / Email)</th>
                    <th className="py-3 px-4">Perihal</th>
                    <th className="py-3 px-4">Isi Pesan</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pesan.length > 0 ? (
                    pesan.map((m) => {
                      const cleanTel = (m.telepon || '').replace(/[^0-9]/g, '');
                      const waReplyUrl = `https://wa.me/${cleanTel.startsWith('0') ? '62' + cleanTel.slice(1) : cleanTel}?text=Assalamu'alaikum%20${encodeURIComponent(m.nama)},%20kami%20dari%20Yayasan%20Bina%20Asri%20terkait%20pesan%20Anda.`;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">{m.timestamp}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{m.nama}</td>
                          <td className="py-3 px-4">
                            <a
                              href={waReplyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{m.telepon}</span>
                            </a>
                            {m.email && <span className="block text-[11px] text-slate-400">{m.email}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                              {m.subjek}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs">{m.pesan}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Hapus pesan dari "${m.nama}"?`)) deletePesan(m.id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
                              title="Hapus Pesan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                        Kotak masuk pesan masih kosong.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: PENGATURAN AKUN */}
        {dashboardTab === 'pengaturan' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-md animate-in fade-in duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">⚙️ Ubah Sandi Akun Admin</h3>
            <p className="text-xs text-slate-500 mb-6">Ganti password masuk administrator untuk keamanan sistem.</p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Masukkan password saat ini (default: admin123)"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru (min. 5 karakter)</label>
                <input
                  type="password"
                  required
                  minLength={5}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:border-emerald-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={5}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:border-emerald-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Password Baru</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB SUPABASE: DATABASE CLOUD INTEGRATION */}
        {dashboardTab === 'supabase' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                  <Database className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">
                      Integrasi Database Supabase
                    </h3>
                    {supabaseStatus ? (
                      supabaseStatus.connected ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Terhubung (Aktif)</span>
                        </span>
                      ) : supabaseStatus.isConfigured ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Perlu Pembuatan Tabel</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>Mode Lokal (Belum Terhubung)</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        <span>Klik Cek Status</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Hubungkan situs Yayasan Bina Asri ke cloud database PostgreSQL Supabase untuk penyimpanan data online yang aman, cepat, dan otomatis tersinkronisasi.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchSupabaseStatus}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>{supabaseStatus?.loading ? 'Memeriksa...' : 'Cek Status'}</span>
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <span>Buka Supabase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Status Message Banner if present */}
            {supabaseStatus && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  supabaseStatus.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : supabaseStatus.isConfigured
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">{supabaseStatus.message}</p>
                    {supabaseStatus.url && (
                      <p className="text-[11px] opacity-80 mt-0.5">Endpoint: {supabaseStatus.url}</p>
                    )}
                  </div>
                </div>
                {supabaseStatus.isConfigured && (
                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Table Counts Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>📊 Status Tabel Database</span>
                </h4>
                <button
                  type="button"
                  onClick={handleSyncToSupabase}
                  disabled={isSyncingSupabase}
                  className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSupabase ? 'Sedang Sinkron...' : 'Unggah Semua Data ke Supabase'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Berita & Artikel</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['berita'] ?? berita.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: berita</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Program Kerja</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['programs'] ?? program.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: programs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Galeri Foto</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['galeri'] ?? galeri.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: galeri</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pengurus & Cabang</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['pengurus'] ?? pengurus.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: pengurus</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Rekening Donasi</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['banks'] ?? banks.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: banks</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pesan Pengunjung</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['pesan'] ?? pesan.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: pesan</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pengaturan Teks Halaman</span>
                  <strong className="text-lg font-black text-slate-900">
                    {supabaseStatus?.tableCounts?.['site_content'] ?? Object.keys(kontenWeb).length} Butir
                  </strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: site_content</span>
                </div>
              </div>
            </div>

            {/* SQL Script Copier Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    ⚡ Skrip SQL Pembuatan Tabel Supabase (DDL)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Salin skrip SQL ini lalu jalankan di menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- Skema Yayasan Bina Asri
CREATE TABLE IF NOT EXISTS public.site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.berita (id BIGINT PRIMARY KEY, judul TEXT NOT NULL, tanggal TEXT NOT NULL, raw_tanggal TEXT, kategori TEXT NOT NULL DEFAULT 'Sosial', ringkasan TEXT NOT NULL, konten TEXT NOT NULL, gambar TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.programs (id BIGINT PRIMARY KEY, nama TEXT NOT NULL, deskripsi TEXT NOT NULL, target TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.galeri (id BIGINT PRIMARY KEY, judul TEXT NOT NULL, gambar TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.pengurus (id BIGINT PRIMARY KEY, nama TEXT NOT NULL, jabatan TEXT NOT NULL, foto TEXT NOT NULL, cabang TEXT NOT NULL DEFAULT 'Pusat / Wilayah Kalbar', kontak TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.banks (id BIGINT PRIMARY KEY, bank TEXT NOT NULL, badge TEXT NOT NULL DEFAULT 'Daerah', norek TEXT NOT NULL, an TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.pesan (id BIGINT PRIMARY KEY, timestamp TEXT NOT NULL, nama TEXT NOT NULL, email TEXT, telepon TEXT NOT NULL, subjek TEXT NOT NULL, pesan TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);
CREATE TABLE IF NOT EXISTS public.admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Public read berita" ON public.berita FOR SELECT USING (true);
CREATE POLICY "Public read programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Public read galeri" ON public.galeri FOR SELECT USING (true);
CREATE POLICY "Public read pengurus" ON public.pengurus FOR SELECT USING (true);
CREATE POLICY "Public read banks" ON public.banks FOR SELECT USING (true);
CREATE POLICY "Public insert pesan" ON public.pesan FOR INSERT WITH CHECK (true);
CREATE POLICY "Service full site_content" ON public.site_content USING (true) WITH CHECK (true);
CREATE POLICY "Service full berita" ON public.berita USING (true) WITH CHECK (true);
CREATE POLICY "Service full programs" ON public.programs USING (true) WITH CHECK (true);
CREATE POLICY "Service full galeri" ON public.galeri USING (true) WITH CHECK (true);
CREATE POLICY "Service full pengurus" ON public.pengurus USING (true) WITH CHECK (true);
CREATE POLICY "Service full banks" ON public.banks USING (true) WITH CHECK (true);
CREATE POLICY "Service full pesan" ON public.pesan USING (true) WITH CHECK (true);
CREATE POLICY "Service full admin_settings" ON public.admin_settings USING (true) WITH CHECK (true);`;
                    navigator.clipboard.writeText(sql).then(() => {
                      setSqlCopied(true);
                      showToast('Skrip SQL Supabase berhasil disalin!', 'success');
                      setTimeout(() => setSqlCopied(false), 2500);
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  {sqlCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{sqlCopied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL Lengkap'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                <pre>{`-- Salin skrip lengkap ini dan jalankan di SQL Editor Supabase
CREATE TABLE IF NOT EXISTS public.site_content (key TEXT PRIMARY KEY, value TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.berita (id BIGINT PRIMARY KEY, judul TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.programs (id BIGINT PRIMARY KEY, nama TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.galeri (id BIGINT PRIMARY KEY, judul TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.pengurus (id BIGINT PRIMARY KEY, nama TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.banks (id BIGINT PRIMARY KEY, bank TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.pesan (id BIGINT PRIMARY KEY, timestamp TEXT NOT NULL, ...);
CREATE TABLE IF NOT EXISTS public.admin_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, ...);`}</pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                <h5 className="font-bold text-slate-800">📖 Panduan 3 Langkah Menghubungkan Supabase:</h5>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buat project baru gratis di <strong>supabase.com</strong>.</li>
                  <li>Buka <strong>SQL Editor</strong> di dashboard Supabase, tempel skrip di atas, lalu klik <strong>Run</strong>.</li>
                  <li>Buka <strong>Project Settings &gt; API</strong>, salin <strong>URL</strong> dan <strong>anon key / service_role key</strong>, lalu masukkan ke file <code>.env</code> Anda.</li>
                </ol>
                <p className="text-[11px] text-slate-500 pt-1">
                  Panduan lengkap langkah demi langkah juga tersedia pada file <code>PANDUAN_SUPABASE.md</code> di repositori proyek.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: CADANGKAN & PULIHKAN (GOOGLE DRIVE, SHEETS & LOKAL) */}
        {dashboardTab === 'backup' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
            {/* 1. GOOGLE WORKSPACE BACKUP (DRIVE & SHEETS) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Pencadangan Cloud Google Workspace
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cadangkan data secara instan ke Google Drive atau ekspor ke Google Spreadsheet resmi yayasan.
                    </p>
                  </div>
                </div>

                {/* Google Auth Status / Button */}
                <div>
                  {!googleUser ? (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoggingIn}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2.5 shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      <span>{isGoogleLoggingIn ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 pr-3 rounded-full border">
                      {googleUser.photoURL ? (
                        <img src={googleUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          G
                        </div>
                      )}
                      <div className="text-[11px] leading-tight">
                        <strong className="block text-slate-800">{googleUser.displayName || 'Akun Google'}</strong>
                        <span className="text-slate-400">{googleUser.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleLogout}
                        className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                        title="Putuskan koneksi Google"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2 Cloud Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Google Drive */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-900">
                      <HardDrive className="w-5 h-5 text-blue-600" />
                      <h4 className="font-extrabold text-sm">Google Drive (Cadangan JSON)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menyimpan berkas arsip lengkap database (artikel, program, pengurus cabang, rekening, donasi) langsung ke Google Drive pribadi atau yayasan.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleBackupToDrive}
                      disabled={isDriveBackingUp || !googleUser}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
                    >
                      <HardDrive className={`w-4 h-4 ${isDriveBackingUp ? 'animate-bounce' : ''}`} />
                      <span>{isDriveBackingUp ? 'Sedang Mengunggah...' : '🚀 Cadangkan ke Google Drive'}</span>
                    </button>

                    {driveResult && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                        <span className="truncate max-w-[190px] font-medium">{driveResult.name}</span>
                        <a
                          href={driveResult.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-700 hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>Buka File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option B: Google Sheets */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-900">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-extrabold text-sm">Google Sheets (Spreadsheet)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Membuat spreadsheet baru otomatis dengan 7 tab terpisah (Berita, Program, Pengurus, Rekening, Galeri, Pesan, Konten) lengkap dengan format tabel.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleExportToSheets}
                      disabled={isSheetsExporting || !googleUser}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
                    >
                      <FileSpreadsheet className={`w-4 h-4 ${isSheetsExporting ? 'animate-bounce' : ''}`} />
                      <span>{isSheetsExporting ? 'Membuat Spreadsheet...' : '📊 Ekspor ke Google Sheets'}</span>
                    </button>

                    {sheetsResult && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                        <span className="font-medium text-emerald-950">Spreadsheet Berhasil Dibuat!</span>
                        <a
                          href={sheetsResult.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>Buka Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!googleUser && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
                  💡 <strong>Catatan:</strong> Klik tombol <strong>"Hubungkan Akun Google"</strong> di atas untuk mengizinkan aplikasi menyimpan berkas ke Google Drive dan Google Sheets Anda dengan aman.
                </p>
              )}
            </div>

            {/* 2. PENCADANGAN FILE LOKAL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 mb-0.5">💾 Cadangkan File Manual (JSON)</h3>
                <p className="text-xs text-slate-500">
                  Unduh file arsip ke laptop/perangkat Anda atau pulihkan dari file cadangan yang pernah diunduh.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Unduh Cadangan</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Simpan format .json ke laptop</p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-sky-950">Impor Cadangan</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Pulihkan dari file .json</p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih File</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-bold text-xs text-rose-700">Kembalikan ke Data Bawaan Yayasan</h4>
                  <p className="text-[11px] text-slate-500">Mereset semua isi website ke data awal yayasan.</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mereset seluruh data website ke pengaturan awal?')) {
                      resetToDefaults();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
