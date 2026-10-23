import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { BeritaItem, ProgramItem, PengurusItem, BankAccount, KontenWeb, AppUser, UserRole } from '../types';
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
  Rocket,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Lock,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  X
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
import {
  getSupabaseConfig,
  testSupabaseConnection,
  saveClientSupabaseConfig,
  clearClientSupabaseConfig,
  sanitizeSupabaseUrl,
} from '../lib/supabase.ts';

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
    users,
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
    addUser,
    updateUser,
    deleteUser,
    changePasswordForUser,
    exportDataJson,
    importDataJson,
    resetToDefaults,
    showToast,
    syncLocalToSupabaseClient
  } = useFoundation();

  // Role calculation
  const userRole = (adminSession?.user?.role || '').toLowerCase();
  const isSuperAdmin = userRole === 'superadmin' || userRole.includes('super');

  // Local state for "Edit Semua Konten" form
  const [formData, setFormData] = useState<KontenWeb>({ ...kontenWeb });
  const [adminCabangFilter, setAdminCabangFilter] = useState<string>('Semua');

  // Password change state (for logged-in user)
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showMyOldPass, setShowMyOldPass] = useState(false);
  const [showMyNewPass, setShowMyNewPass] = useState(false);
  const [isChangingMyPass, setIsChangingMyPass] = useState(false);

  // User Management states (Super Admin)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userForm, setUserForm] = useState<{
    username: string;
    password: string;
    nama: string;
    role: UserRole;
    email: string;
    status: 'active' | 'inactive';
  }>({
    username: '',
    password: '',
    nama: '',
    role: 'editor',
    email: '',
    status: 'active',
  });
  const [showUserFormPass, setShowUserFormPass] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Reset User Password Modal (Super Admin)
  const [resetPassModalUser, setResetPassModalUser] = useState<AppUser | null>(null);
  const [newPassForTargetUser, setNewPassForTargetUser] = useState('');
  const [showResetPassInput, setShowResetPassInput] = useState(false);
  const [isResettingUserPass, setIsResettingUserPass] = useState(false);

  // Supabase state
  const [supabaseInputUrl, setSupabaseInputUrl] = useState('');
  const [supabaseInputKey, setSupabaseInputKey] = useState('');
  const [isSavingSupabaseConfig, setIsSavingSupabaseConfig] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    loading: boolean;
    isConfigured: boolean;
    connected: boolean;
    message: string;
    url?: string;
    tableCounts?: Record<string, number>;
    missingTables?: string[];
    diagnostic?: string;
  } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Initialize Supabase inputs from current config on mount
  React.useEffect(() => {
    const cfg = getSupabaseConfig();
    if (cfg.url) setSupabaseInputUrl(cfg.url);
    if (cfg.key) setSupabaseInputKey(cfg.key);
    fetchSupabaseStatus(cfg.url, cfg.key);
  }, []);

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

  const fetchSupabaseStatus = async (overrideUrl?: string, overrideKey?: string) => {
    setSupabaseStatus((prev) => ({
      loading: true,
      isConfigured: prev?.isConfigured ?? false,
      connected: prev?.connected ?? false,
      message: 'Memeriksa status koneksi Supabase...',
      url: prev?.url ?? '',
      tableCounts: prev?.tableCounts ?? {},
    }));

    const urlToTest = overrideUrl ?? supabaseInputUrl;
    const keyToTest = overrideKey ?? supabaseInputKey;

    // 1. Try server endpoint
    try {
      const res = await fetch('/api/supabase/status');
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        setSupabaseStatus({
          loading: false,
          isConfigured: Boolean(data.isConfigured || (urlToTest && keyToTest)),
          connected: Boolean(data.connected),
          message: data.message || 'Status Supabase dicek.',
          url: data.url || (urlToTest ? sanitizeSupabaseUrl(urlToTest) : ''),
          tableCounts: data.tableCounts || {},
          missingTables: data.missingTables || [],
          diagnostic: data.diagnostic,
        });
        return;
      }
    } catch {}

    // 2. Client-side direct test (works even on static Vercel!)
    try {
      const testResult = await testSupabaseConnection(urlToTest, keyToTest);
      setSupabaseStatus({
        loading: false,
        isConfigured: Boolean(urlToTest && keyToTest),
        connected: testResult.connected,
        message: testResult.message,
        url: urlToTest ? sanitizeSupabaseUrl(urlToTest) : '',
        tableCounts: testResult.tableCounts || {},
        missingTables: testResult.missingTables || [],
        diagnostic: testResult.diagnostic,
      });
    } catch (err: any) {
      setSupabaseStatus({
        loading: false,
        isConfigured: false,
        connected: false,
        message: `Gagal memeriksa koneksi: ${err.message}`,
        diagnostic: 'network_error',
      });
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseInputUrl.trim() || !supabaseInputKey.trim()) {
      showToast('Harap masukkan URL Proyek dan API Key Supabase!', 'error');
      return;
    }

    const cleanUrl = sanitizeSupabaseUrl(supabaseInputUrl);
    const cleanKey = supabaseInputKey.trim();

    setIsSavingSupabaseConfig(true);

    // Save to client localStorage immediately (persists on Vercel frontend)
    saveClientSupabaseConfig(cleanUrl, cleanKey);

    // Also persist to server endpoint if running in fullstack mode
    try {
      await fetch('/api/supabase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, key: cleanKey }),
      });
    } catch {}

    setIsSavingSupabaseConfig(false);
    showToast('Kredensial Supabase berhasil disimpan!', 'success');

    // Run connection test
    await fetchSupabaseStatus(cleanUrl, cleanKey);
  };

  const handleClearSupabaseConfig = () => {
    if (!confirm('Hapus kredensial Supabase dari penyimpanan?')) return;
    clearClientSupabaseConfig();
    setSupabaseInputUrl('');
    setSupabaseInputKey('');
    setSupabaseStatus(null);
    showToast('Kredensial Supabase telah dihapus.', 'info');
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    let success = false;
    let msg = '';

    const cleanUrl = sanitizeSupabaseUrl(supabaseInputUrl);
    const cleanKey = supabaseInputKey.trim();

    // 1. Try server sync endpoint first (runs in Node.js, free of browser CORS limitations)
    try {
      const res = await fetch('/api/supabase/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          key: cleanKey,
          data: {
            kontenWeb,
            berita,
            program,
            galeri,
            pengurus,
            banks,
            pesan,
            users,
          },
        }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data.success) {
          success = true;
          msg = data.message;
        } else {
          msg = data.message;
        }
      }
    } catch (err: any) {
      console.warn('Server sync note:', err);
    }

    // 2. Client-side fallback sync (for static Vercel or when backend is unavailable)
    if (!success) {
      try {
        const clientSync = await syncLocalToSupabaseClient();
        success = clientSync.success;
        msg = clientSync.message;
      } catch (err: any) {
        msg = err.message || 'Sinkronisasi gagal.';
      }
    }

    setIsSyncingSupabase(false);
    if (success) {
      showToast(msg || 'Seluruh data Yayasan berhasil disinkronkan ke Supabase!', 'success');
      await fetchSupabaseStatus(cleanUrl, cleanKey);
    } else {
      showToast(msg || 'Gagal sinkronisasi data ke Supabase.', 'error');
      // Refresh status to reflect exact diagnostic state
      await fetchSupabaseStatus(cleanUrl, cleanKey);
    }
  };

  // Role-based tabs
  const baseTabs = [
    { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'konten', label: 'Edit Semua Halaman', icon: <FileText className="w-4 h-4" /> },
    { id: 'berita', label: `Berita (${berita.length})`, icon: <Newspaper className="w-4 h-4" /> },
    { id: 'program', label: `Program (${program.length})`, icon: <Target className="w-4 h-4" /> },
    { id: 'galeri', label: `Galeri (${galeri.length})`, icon: <Image className="w-4 h-4" /> },
    { id: 'pengurus', label: `Pengurus (${pengurus.length})`, icon: <Users className="w-4 h-4" /> },
    { id: 'banks', label: `Rekening (${banks.length})`, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'pesan', label: `Pesan (${pesan.length})`, icon: <Inbox className="w-4 h-4" /> },
  ];

  const superAdminTabs = [
    { id: 'users', label: `Manajemen User (${users.length})`, icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
    { id: 'supabase', label: 'Database Supabase', icon: <Database className="w-4 h-4 text-emerald-600" /> },
    { id: 'pengaturan', label: 'Akun & Sandi', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'backup', label: 'Cadangkan / Pulihkan', icon: <Download className="w-4 h-4" /> }
  ];

  const editorTabs = [
    { id: 'pengaturan', label: 'Akun & Sandi', icon: <KeyRound className="w-4 h-4" /> }
  ];

  const tabs = isSuperAdmin ? [...baseTabs, ...superAdminTabs] : [...baseTabs, ...editorTabs];

  const handleSaveAllKonten = (e: React.FormEvent) => {
    e.preventDefault();
    saveFullKonten(formData);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPass) {
      showToast('Masukkan kata sandi saat ini!', 'error');
      return;
    }
    if (newPass.length < 5) {
      showToast('Kata sandi baru minimal 5 karakter!', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('Konfirmasi password baru tidak cocok!', 'error');
      return;
    }
    setIsChangingMyPass(true);
    const res = await changeAdminPassword(oldPass, newPass);
    setIsChangingMyPass(false);
    if (res.success) {
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // User Management Handlers (Super Admin Only)
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      nama: '',
      role: 'editor',
      email: '',
      status: 'active',
    });
    setShowUserFormPass(false);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: AppUser) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      password: '', // Leave blank unless changing password
      nama: u.nama,
      role: u.role,
      email: u.email || '',
      status: u.status,
    });
    setShowUserFormPass(false);
    setUserModalOpen(true);
  };

  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nama.trim() || !userForm.username.trim()) {
      showToast('Nama dan username wajib diisi!', 'error');
      return;
    }
    if (!editingUser && (!userForm.password || userForm.password.length < 5)) {
      showToast('Password pengguna baru minimal 5 karakter!', 'error');
      return;
    }
    setIsSavingUser(true);
    if (editingUser) {
      const res = await updateUser({
        ...editingUser,
        nama: userForm.nama.trim(),
        username: userForm.username.trim().toLowerCase(),
        role: userForm.role,
        email: userForm.email.trim(),
        status: userForm.status,
        password: userForm.password ? userForm.password.trim() : editingUser.password,
      });
      setIsSavingUser(false);
      if (res.success) {
        setUserModalOpen(false);
      }
    } else {
      const res = await addUser({
        nama: userForm.nama.trim(),
        username: userForm.username.trim().toLowerCase(),
        password: userForm.password.trim(),
        role: userForm.role,
        email: userForm.email.trim(),
        status: userForm.status,
      });
      setIsSavingUser(false);
      if (res.success) {
        setUserModalOpen(false);
      }
    }
  };

  const handleDeleteUserClick = async (u: AppUser) => {
    if (adminSession?.user?.username?.toLowerCase() === u.username.toLowerCase()) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${u.nama}" (@${u.username})?`)) {
      await deleteUser(u.id);
    }
  };

  const handleOpenResetPassModal = (u: AppUser) => {
    setResetPassModalUser(u);
    setNewPassForTargetUser('');
    setShowResetPassInput(false);
  };

  const handleSaveResetPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassModalUser) return;
    if (!newPassForTargetUser || newPassForTargetUser.length < 5) {
      showToast('Password baru minimal 5 karakter!', 'error');
      return;
    }
    setIsResettingUserPass(true);
    const res = await changePasswordForUser(resetPassModalUser.username, newPassForTargetUser.trim());
    setIsResettingUserPass(false);
    if (res.success) {
      setResetPassModalUser(null);
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
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] text-slate-300">
                  Masuk sebagai: <b className="text-white">{adminSession?.user.nama}</b>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSuperAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}
                >
                  {isSuperAdmin ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <UserCheck className="w-3 h-3 text-sky-400" />}
                  <span>{isSuperAdmin ? 'Super Admin' : 'Editor Konten'}</span>
                </span>
              </div>
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

        {/* ACCESS RESTRICTION BANNER FOR NON-SUPERADMIN */}
        {!isSuperAdmin && (dashboardTab === 'supabase' || dashboardTab === 'users' || dashboardTab === 'backup') && (
          <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-xl p-8 max-w-xl mx-auto my-12 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-rose-950 mb-2">
              Akses Dibatasi: Khusus Super Admin
            </h3>
            <p className="text-xs text-rose-700 leading-relaxed mb-6">
              Halaman <strong>{dashboardTab === 'supabase' ? 'Database Supabase' : dashboardTab === 'users' ? 'Manajemen Pengguna' : 'Cadangkan & Pulihkan'}</strong> hanya dapat diakses oleh <strong>Super Administrator</strong> Yayasan.
              Akun Anda terdaftar dengan peran <strong>Editor Konten Web</strong>.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 mb-6 space-y-2">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Fitur Pengelolaan yang Dapat Anda Akses:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>Mengedit seluruh teks &amp; narasi halaman website secara langsung</li>
                <li>Menerbitkan, mengedit, dan menghapus Berita Yayasan</li>
                <li>Mengelola Program Kerja, Capaian Target, dan Skrining TBC</li>
                <li>Mengunggah &amp; memperbarui Galeri Dokumentasi Kegiatan</li>
                <li>Mengatur data Pengurus Cabang Kabupaten/Kota se-Kalbar</li>
                <li>Mengelola Rekening Donasi dan membaca Kotak Pesan Pengunjung</li>
                <li>Mengubah kata sandi akun Anda sendiri pada menu "Akun &amp; Sandi"</li>
              </ul>
            </div>
            <button
              onClick={() => setDashboardTab('overview')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all"
            >
              Kembali ke Ringkasan Dashboard
            </button>
          </div>
        )}

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

        {/* TAB MANAJEMEN USER & HAK AKSES (KHUSUS SUPER ADMIN) */}
        {dashboardTab === 'users' && isSuperAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">
                      Manajemen Pengguna &amp; Hak Akses Website
                    </h3>
                    <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Role-Based Access Control (RBAC)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl">
                    Kelola akun staf dan redaksi yang berhak mengedit website. Super Admin dapat menambah pengguna baru, menentukan peran, mereset password, serta membatasi akses database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddUser}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-800/20 transition-all hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Pengguna Baru</span>
                </button>
              </div>
            </div>

            {/* Role Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-black text-lg">
                  {users.length}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Total Akun Terdaftar</h4>
                  <span className="text-xs text-slate-500">Semua staf &amp; pengelola website</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-black text-lg">
                  {users.filter((u) => u.role === 'superadmin').length}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Super Administrator</span>
                  </h4>
                  <span className="text-xs text-emerald-700">Akses penuh + Database &amp; User</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-sky-200 bg-sky-50/40 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 font-black text-lg">
                  {users.filter((u) => u.role === 'editor').length}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-sky-950 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    <span>Editor / Redaksi</span>
                  </h4>
                  <span className="text-xs text-sky-700">Edit konten saja (Tanpa Database)</span>
                </div>
              </div>
            </div>

            {/* Security Explanation Note */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">🔒 Aturan Hak Akses Pengguna Yayasan:</strong>
                <p className="leading-relaxed">
                  Pengguna dengan peran <strong>Editor Konten</strong> hanya dapat mengedit berita, program, pengurus cabang, galeri, rekening donasi, dan teks website. Halaman <strong>Database Supabase</strong> dan <strong>Cadangkan/Pulihkan</strong> otomatis disembunyikan serta diblokir sehingga Editor tidak memiliki akses ke data sensitif database.
                </p>
              </div>
            </div>

            {/* Users Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Akun Pengguna Website</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">{users.length} Akun Terdaftar</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-3.5 px-4">Pengguna</th>
                      <th className="py-3.5 px-4">Username</th>
                      <th className="py-3.5 px-4">Peran Sistem</th>
                      <th className="py-3.5 px-4">Akses Database</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi &amp; Sandi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map((u) => {
                      const isCurrent = adminSession?.user?.username?.toLowerCase() === u.username.toLowerCase();
                      const isSuper = u.role === 'superadmin';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isSuper ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-sky-100 text-sky-800 border border-sky-200'
                                }`}
                              >
                                {u.nama.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.nama}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
                                      Akun Anda
                                    </span>
                                  )}
                                </p>
                                <span className="text-[11px] text-slate-400">{u.email || 'Tanpa email terdaftar'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            @{u.username}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isSuper
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-sky-100 text-sky-800 border border-sky-200'
                              }`}
                            >
                              {isSuper ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{isSuper ? 'Super Admin' : 'Editor Konten'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Akses Database Penuh</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-[11px]">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Dibatasi (Hanya Konten)</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                              ></span>
                              <span>{u.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassModal(u)}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 border border-amber-200 transition-colors shadow-sm"
                                title="Ganti Password Akun Ini"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>Ganti Sandi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                title="Edit Data Pengguna"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isCurrent || (isSuper && users.filter((x) => x.role === 'superadmin').length <= 1)}
                                onClick={() => handleDeleteUserClick(u)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-30 disabled:hover:bg-rose-50 transition-colors"
                                title={isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PENGATURAN AKUN & UBAH KATA SANDI */}
        {dashboardTab === 'pengaturan' && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md ${
                    isSuperAdmin
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
                      : 'bg-gradient-to-br from-sky-600 to-blue-800'
                  }`}
                >
                  {(adminSession?.user.nama || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{adminSession?.user.nama}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isSuperAdmin
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {isSuperAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> : <UserCheck className="w-3.5 h-3.5 text-sky-700" />}
                      <span>{isSuperAdmin ? 'Super Administrator' : 'Editor Konten Web'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Username: <span className="font-bold text-slate-800">@{adminSession?.user.username}</span>
                  </p>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <h5 className="font-bold text-slate-800 mb-1">Tingkat Hak Akses Akun:</h5>
                <p className="leading-relaxed">
                  {isSuperAdmin
                    ? 'Sebagai Super Administrator, Anda memiliki kewenangan penuh atas seluruh konten website, konfigurasi database Supabase, skrip SQL, manajemen pengguna lain, serta pencadangan data.'
                    : 'Sebagai Editor Konten, Anda memiliki akses untuk mengedit teks halaman, mempublikasikan berita, program kerja, galeri, pengurus, rekening donasi, serta membaca pesan pengunjung. Akses konfigurasi database Supabase dan manajemen akun staf dibatasi khusus untuk Super Admin.'}
                </p>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-700" />
                <span>Ubah Kata Sandi Saya</span>
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Perbarui kata sandi login untuk keamanan akun Anda.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showMyOldPass ? 'text' : 'password'}
                      required
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMyOldPass(!showMyOldPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showMyOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password Baru (min. 5 karakter) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showMyNewPass ? 'text' : 'password'}
                      required
                      minLength={5}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMyNewPass(!showMyNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showMyNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Konfirmasi Password Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showMyNewPass ? 'text' : 'password'}
                      required
                      minLength={5}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingMyPass}
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isChangingMyPass ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB SUPABASE: DATABASE CLOUD INTEGRATION (SUPER ADMIN ONLY) */}
        {dashboardTab === 'supabase' && isSuperAdmin && (
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
                  onClick={() => fetchSupabaseStatus()}
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

            {/* Supabase Credentials Setup Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>🔑 Pengaturan Kredensial Supabase</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan URL Proyek dan API Key Supabase Anda. Tersimpan di browser (Vercel) dan file konfigurasi server agar data tidak hilang saat commit &amp; deploy ulang.
                  </p>
                </div>
                {supabaseInputUrl && (
                  <button
                    type="button"
                    onClick={handleClearSupabaseConfig}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                  >
                    Hapus Kredensial
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project URL Supabase <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={supabaseInputUrl}
                      onChange={(e) => setSupabaseInputUrl(e.target.value)}
                      placeholder="https://xyzabcdefghijklm.supabase.co"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Format: <code>https://&lt;id-proyek&gt;.supabase.co</code> (Bukan URL postgresql://)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      API Key (anon / public atau service_role) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={supabaseInputKey}
                      onChange={(e) => setSupabaseInputKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Dapatkan dari dashboard Supabase: <strong>Project Settings &gt; API</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    type="submit"
                    disabled={isSavingSupabaseConfig}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSupabaseConfig ? 'Menyimpan...' : 'Simpan Kredensial & Hubungkan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchSupabaseStatus(supabaseInputUrl, supabaseInputKey)}
                    disabled={supabaseStatus?.loading}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus?.loading ? 'animate-spin' : ''}`} />
                    <span>Uji Koneksi Sekarang</span>
                  </button>

                  {supabaseStatus?.connected && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      Database Aktif &amp; Terhubung
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Status Message Banner if present */}
            {supabaseStatus && (
              <div
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  supabaseStatus.connected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : supabaseStatus.isConfigured
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-sm">{supabaseStatus.message}</p>
                    {supabaseStatus.url && (
                      <p className="text-[11px] opacity-80 mt-0.5 font-mono">Endpoint: {supabaseStatus.url}</p>
                    )}
                  </div>
                </div>
                {supabaseStatus.isConfigured && (
                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-all shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Diagnostic Troubleshooting Box if connection is not fully connected */}
            {supabaseStatus && !supabaseStatus.connected && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50/50 to-orange-50 border border-amber-300 text-amber-950 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 font-black text-sm text-amber-950">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Panduan Mengatasi Error Koneksi &amp; Sinkronisasi Supabase</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <strong className="block font-bold text-amber-950 mb-1">
                        1. Proyek Supabase Paused (Tertidur)?
                      </strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Penyebab utama pesan <code>Failed to fetch</code>: Supabase Free Tier otomatis mem-pause proyek jika tidak aktif 7 hari.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-700 underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka Dashboard &amp; Klik "Restore Project"</span>
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <strong className="block font-bold text-amber-950 mb-1">
                        2. Jalankan Skrip SQL di Supabase
                      </strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Tabel database belum dibuat di Supabase Anda. Anda wajib menjalankan skrip SQL di menu SQL Editor agar tabel tersedia.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700">
                        Gunakan tombol "Salin Skrip SQL Lengkap" di bawah
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <strong className="block font-bold text-amber-950 mb-1">
                        3. Periksa URL &amp; API Key
                      </strong>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Pastikan URL berformat <code>https://&lt;id-proyek&gt;.supabase.co</code> dan API Key menggunakan <strong>anon public key</strong> (diawali <code>eyJ...</code>).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500">
                        Project Settings &gt; API
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Missing Tables Warning */}
            {supabaseStatus?.missingTables && supabaseStatus.missingTables.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <strong className="block font-bold">⚠️ Tabel Belum Ditemukan di Supabase:</strong>
                <p>
                  Tabel berikut belum dibuat di database Anda: <code>{supabaseStatus.missingTables.join(', ')}</code>.
                  Salin skrip SQL di bawah dan jalankan di SQL Editor Supabase untuk membuatnya secara otomatis.
                </p>
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
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Berita &amp; Artikel</span>
                  {supabaseStatus?.tableCounts?.['berita'] !== undefined && supabaseStatus.tableCounts['berita'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['berita'] ?? berita.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: berita</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Program Kerja</span>
                  {supabaseStatus?.tableCounts?.['programs'] !== undefined && supabaseStatus.tableCounts['programs'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['programs'] ?? program.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: programs</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Galeri Foto</span>
                  {supabaseStatus?.tableCounts?.['galeri'] !== undefined && supabaseStatus.tableCounts['galeri'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['galeri'] ?? galeri.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: galeri</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pengurus &amp; Cabang</span>
                  {supabaseStatus?.tableCounts?.['pengurus'] !== undefined && supabaseStatus.tableCounts['pengurus'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['pengurus'] ?? pengurus.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: pengurus</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Rekening Donasi</span>
                  {supabaseStatus?.tableCounts?.['banks'] !== undefined && supabaseStatus.tableCounts['banks'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['banks'] ?? banks.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: banks</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pesan Pengunjung</span>
                  {supabaseStatus?.tableCounts?.['pesan'] !== undefined && supabaseStatus.tableCounts['pesan'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['pesan'] ?? pesan.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: pesan</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pengguna Website</span>
                  {supabaseStatus?.tableCounts?.['app_users'] !== undefined && supabaseStatus.tableCounts['app_users'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['app_users'] ?? users.length}
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: app_users</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Pengaturan Teks Halaman</span>
                  {supabaseStatus?.tableCounts?.['site_content'] !== undefined && supabaseStatus.tableCounts['site_content'] < 0 ? (
                    <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Perlu Skrip SQL
                    </span>
                  ) : (
                    <strong className="text-lg font-black text-slate-900">
                      {supabaseStatus?.tableCounts?.['site_content'] ?? Object.keys(kontenWeb).length} Butir
                    </strong>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-0.5">tabel: site_content</span>
                </div>
              </div>
            </div>

            {/* SQL Script Copier Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span>⚡ Skrip SQL Pembuatan Tabel &amp; Hak Akses Supabase (DDL)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Salin skrip SQL ini lalu jalankan di menu <strong>SQL Editor</strong> di dashboard Supabase Anda.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const sqlAll = `BEGIN;

-- ====================================================================
-- SKEMA DATABASE RESMI: YAYASAN BINA ASRI KALIMANTAN BARAT
-- ====================================================================

-- 1. TABEL KONTEN & HALAMAN
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL BERITA & ARTIKEL
CREATE TABLE IF NOT EXISTS public.berita (
  id BIGINT PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  raw_tanggal TEXT,
  kategori TEXT NOT NULL DEFAULT 'Sosial',
  ringkasan TEXT NOT NULL,
  konten TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL PROGRAM KERJA
CREATE TABLE IF NOT EXISTS public.programs (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  target TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL GALERI FOTO
CREATE TABLE IF NOT EXISTS public.galeri (
  id BIGINT PRIMARY KEY,
  judul TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL PENGURUS & CABANG DAERAH
CREATE TABLE IF NOT EXISTS public.pengurus (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT NOT NULL,
  cabang TEXT NOT NULL DEFAULT 'Pusat / SR Kalbar',
  kontak TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL REKENING BANK DONASI
CREATE TABLE IF NOT EXISTS public.banks (
  id BIGINT PRIMARY KEY,
  bank TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Daerah',
  norek TEXT NOT NULL,
  an TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL PESAN MASUK PENGUNJUNG
CREATE TABLE IF NOT EXISTS public.pesan (
  id BIGINT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  nama TEXT NOT NULL,
  email TEXT,
  telepon TEXT NOT NULL,
  subjek TEXT NOT NULL,
  pesan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL PENGATURAN ADMIN
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABEL PENGGUNA & HAK AKSES (RBAC)
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- 10. HAK AKSES PERMISSIONS
GRANT ALL ON TABLE public.site_content TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.berita TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.galeri TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pengurus TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.banks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pesan TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_users TO anon, authenticated, service_role;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public access berita" ON public.berita;
DROP POLICY IF EXISTS "Public access programs" ON public.programs;
DROP POLICY IF EXISTS "Public access galeri" ON public.galeri;
DROP POLICY IF EXISTS "Public access pengurus" ON public.pengurus;
DROP POLICY IF EXISTS "Public access banks" ON public.banks;
DROP POLICY IF EXISTS "Public access pesan" ON public.pesan;
DROP POLICY IF EXISTS "Public access admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Public access app_users" ON public.app_users;

CREATE POLICY "Public access site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access berita" ON public.berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pengurus" ON public.pengurus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access banks" ON public.banks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pesan" ON public.pesan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);

-- 12. DATA AWAL AKUN & SANDI
INSERT INTO public.admin_settings (key, value) VALUES ('admin_password', 'admin123') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_users (id, username, password, nama, role, email, status)
VALUES 
  ('usr_superadmin_01', 'admin', 'admin123', 'Super Administrator Yayasan', 'superadmin', 'admin@binaasrikalbar.org', 'active'),
  ('usr_editor_01', 'editor', 'editor123', 'Staf Editor Konten Web', 'editor', 'redaksi@binaasrikalbar.org', 'active')
ON CONFLICT (username) DO NOTHING;

COMMIT;`;
                      navigator.clipboard.writeText(sqlAll).then(() => {
                        setSqlCopied(true);
                        showToast('Skrip SQL Lengkap berhasil disalin!', 'success');
                        setTimeout(() => setSqlCopied(false), 2500);
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    {sqlCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{sqlCopied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL Lengkap'}</span>
                  </button>
                </div>
              </div>

              {/* Troubleshooting Warning for 'Only singular query allowed' */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mengatasi Error: "Only singular query allowed"</span>
                </div>
                <p className="leading-relaxed">
                  Pemberitahuan <code>Error: Only singular query allowed</code> muncul jika skrip ditempelkan ke kotak <strong>"Ask Supabase AI"</strong> (kolom chat AI di samping/bawah). Supabase AI hanya menerima pertanyaan teks singkat, bukan kumpulan skrip database.
                </p>
                <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-[11px] space-y-1">
                  <p className="font-bold text-slate-800">✅ Cara Benar Menjalankan di Supabase:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-700 pl-1">
                    <li>Buka menu <strong>SQL Editor</strong> (ikon terminal <code>&gt;_</code> di sidebar kiri Supabase).</li>
                    <li>Klik tombol <strong>"+ New query"</strong> di bagian atas.</li>
                    <li>Tempelkan (*paste*) skrip langsung di <strong>lembar kerja kode utama</strong> (area editor hitam/putih dengan nomor baris 1, 2, 3...), <u>bukan</u> di kotak chat AI.</li>
                    <li>Klik tombol hijau <strong>"Run"</strong> (atau tekan <code>Ctrl + Enter</code>).</li>
                  </ol>
                </div>
              </div>

              {/* Modular Copy Buttons if user prefers running part by part */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700">Atau Salin Berdasarkan Bagian (Jika Ingin Dijalankan Terpisah):</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const part1 = `CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.berita (
  id BIGINT PRIMARY KEY,
  judul TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  raw_tanggal TEXT,
  kategori TEXT NOT NULL DEFAULT 'Sosial',
  ringkasan TEXT NOT NULL,
  konten TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.programs (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  target TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.galeri (
  id BIGINT PRIMARY KEY,
  judul TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pengurus (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT NOT NULL,
  cabang TEXT NOT NULL DEFAULT 'Pusat / SR Kalbar',
  kontak TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.banks (
  id BIGINT PRIMARY KEY,
  bank TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Daerah',
  norek TEXT NOT NULL,
  an TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pesan (
  id BIGINT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  nama TEXT NOT NULL,
  email TEXT,
  telepon TEXT NOT NULL,
  subjek TEXT NOT NULL,
  pesan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);`;
                      navigator.clipboard.writeText(part1).then(() => {
                        showToast('Bagian 1 (Buat Tabel) berhasil disalin!', 'success');
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                  >
                    1. Salin Bagian 1: Buat Tabel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const part2 = `GRANT ALL ON TABLE public.site_content TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.berita TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.galeri TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pengurus TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.banks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pesan TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_users TO anon, authenticated, service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public access berita" ON public.berita;
DROP POLICY IF EXISTS "Public access programs" ON public.programs;
DROP POLICY IF EXISTS "Public access galeri" ON public.galeri;
DROP POLICY IF EXISTS "Public access pengurus" ON public.pengurus;
DROP POLICY IF EXISTS "Public access banks" ON public.banks;
DROP POLICY IF EXISTS "Public access pesan" ON public.pesan;
DROP POLICY IF EXISTS "Public access admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Public access app_users" ON public.app_users;

CREATE POLICY "Public access site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access berita" ON public.berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pengurus" ON public.pengurus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access banks" ON public.banks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pesan" ON public.pesan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);`;
                      navigator.clipboard.writeText(part2).then(() => {
                        showToast('Bagian 2 (Hak Akses & RLS) berhasil disalin!', 'success');
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
                  >
                    2. Salin Bagian 2: Izin Akses &amp; RLS
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const part3 = `INSERT INTO public.admin_settings (key, value) VALUES ('admin_password', 'admin123') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.app_users (id, username, password, nama, role, email, status)
VALUES 
  ('usr_superadmin_01', 'admin', 'admin123', 'Super Administrator Yayasan', 'superadmin', 'admin@binaasrikalbar.org', 'active'),
  ('usr_editor_01', 'editor', 'editor123', 'Staf Editor Konten Web', 'editor', 'redaksi@binaasrikalbar.org', 'active')
ON CONFLICT (username) DO NOTHING;`;
                      navigator.clipboard.writeText(part3).then(() => {
                        showToast('Bagian 3 (Akun Awal) berhasil disalin!', 'success');
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
                  >
                    3. Salin Bagian 3: Akun Awal
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                <pre>{`-- Skrip dibungkus dalam blok transaksi BEGIN ... COMMIT
BEGIN;
CREATE TABLE IF NOT EXISTS public.site_content (...);
CREATE TABLE IF NOT EXISTS public.berita (...);
CREATE TABLE IF NOT EXISTS public.programs (...);
CREATE TABLE IF NOT EXISTS public.galeri (...);
CREATE TABLE IF NOT EXISTS public.pengurus (...);
CREATE TABLE IF NOT EXISTS public.banks (...);
CREATE TABLE IF NOT EXISTS public.pesan (...);
CREATE TABLE IF NOT EXISTS public.admin_settings (...);
CREATE TABLE IF NOT EXISTS public.app_users (...);
GRANT ALL ON ...;
COMMIT;`}</pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                <h5 className="font-bold text-slate-800">📖 Panduan 3 Langkah Menghubungkan Supabase:</h5>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka <strong>SQL Editor</strong> di dashboard Supabase (ikon <code>&gt;_</code> di kiri), klik <strong>New query</strong>, tempel skrip di editor utama, lalu klik <strong>Run</strong>.</li>
                  <li>Buka <strong>Project Settings &gt; API</strong>, salin <strong>Project URL</strong> dan <strong>anon key</strong>.</li>
                  <li>Masukkan pada formulir <strong>🔑 Pengaturan Kredensial Supabase</strong> di atas lalu klik <strong>Simpan Kredensial &amp; Hubungkan</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: CADANGKAN & PULIHKAN (GOOGLE DRIVE, SHEETS & LOKAL - KHUSUS SUPER ADMIN) */}
        {dashboardTab === 'backup' && isSuperAdmin && (
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

        {/* MODAL 1: TAMBAH / EDIT PENGGUNA (SUPER ADMIN) */}
        {userModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setUserModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUser
                    ? `Perbarui informasi akun untuk @${editingUser.username}`
                    : 'Buat akun staf atau editor baru untuk mengelola website.'}
                </p>
              </div>

              <form onSubmit={handleSaveUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                    placeholder="Contoh: Muhammad Ridwan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')
                        })
                      }
                      placeholder="ridwan"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Hanya huruf kecil, angka, garis bawah.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingUser ? 'Password Baru (Opsional)' : 'Password Login'}{' '}
                    {!editingUser && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showUserFormPass ? 'text' : 'password'}
                      required={!editingUser}
                      minLength={5}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 5 karakter'}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserFormPass(!showUserFormPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showUserFormPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Peran &amp; Hak Akses <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: 'editor' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        userForm.role === 'editor'
                          ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-sky-950 mb-0.5">
                        <UserCheck className="w-4 h-4 text-sky-600" />
                        <span>Editor Konten</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Edit berita, program &amp; narasi web. <strong>Database terkunci.</strong>
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: 'superadmin' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        userForm.role === 'superadmin'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950 mb-0.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Super Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Akses penuh seluruh sistem + <strong>Database Supabase.</strong>
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="nama@binaasrikalbar.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="active">Aktif (Dapat Login &amp; Mengedit)</option>
                    <option value="inactive">Nonaktifkan (Akses Diblokir Sementara)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingUser ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: RESET PASSWORD PENGGUNA (SUPER ADMIN) */}
        {resetPassModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setResetPassModalUser(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Ganti Kata Sandi Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Untuk: <strong>{resetPassModalUser.nama}</strong> (@{resetPassModalUser.username})
                </p>
              </div>

              <form onSubmit={handleSaveResetPassSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi Baru (min. 5 karakter) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassInput ? 'text' : 'password'}
                      required
                      minLength={5}
                      value={newPassForTargetUser}
                      onChange={(e) => setNewPassForTargetUser(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassInput(!showResetPassInput)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showResetPassInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetPassModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingUserPass}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isResettingUserPass ? 'Menyimpan...' : 'Perbarui Sandi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
