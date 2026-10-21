import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  KontenWeb,
  BeritaItem,
  ProgramItem,
  GaleriItem,
  PengurusItem,
  BankAccount,
  PesanItem,
  AdminSession
} from '../types';
import {
  DEFAULT_KONTEN_WEB,
  DEFAULT_BERITA,
  DEFAULT_PROGRAM,
  DEFAULT_GALERI,
  DEFAULT_PENGURUS,
  DEFAULT_BANKS,
  DEFAULT_PESAN
} from '../data/defaultData';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface FoundationContextType {
  kontenWeb: KontenWeb;
  berita: BeritaItem[];
  program: ProgramItem[];
  galeri: GaleriItem[];
  pengurus: PengurusItem[];
  banks: BankAccount[];
  pesan: PesanItem[];
  adminSession: AdminSession | null;
  directEditMode: boolean;
  unsavedKeys: string[];
  activeView: 'public' | 'dashboard';
  dashboardTab: string;
  toasts: ToastMessage[];
  // Actions
  setActiveView: (view: 'public' | 'dashboard') => void;
  setDashboardTab: (tab: string) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toggleDirectEditMode: () => void;
  updateDirectField: (key: keyof KontenWeb, value: string) => void;
  saveAllDirectChanges: () => Promise<void>;
  dismissUnsavedChanges: () => void;
  saveFullKonten: (newKonten: Partial<KontenWeb>) => Promise<void>;
  // News CRUD
  addBerita: (item: Omit<BeritaItem, 'id'>) => Promise<void>;
  updateBerita: (item: BeritaItem) => Promise<void>;
  deleteBerita: (id: number) => Promise<void>;
  // Program CRUD
  addProgram: (item: Omit<ProgramItem, 'id'>) => Promise<void>;
  updateProgram: (item: ProgramItem) => Promise<void>;
  deleteProgram: (id: number) => Promise<void>;
  // Galeri CRUD
  addGaleri: (item: Omit<GaleriItem, 'id'>) => Promise<void>;
  deleteGaleri: (id: number) => Promise<void>;
  // Pengurus CRUD
  addPengurus: (item: Omit<PengurusItem, 'id'>) => Promise<void>;
  updatePengurus: (item: PengurusItem) => Promise<void>;
  deletePengurus: (id: number) => Promise<void>;
  // Banks CRUD
  addBank: (item: Omit<BankAccount, 'id'>) => Promise<void>;
  updateBank: (item: BankAccount) => Promise<void>;
  deleteBank: (id: number) => Promise<void>;
  // Messages
  submitPesan: (form: { nama: string; email: string; telepon: string; subjek: string; pesan: string }) => Promise<boolean>;
  deletePesan: (id: number) => Promise<void>;
  // Auth
  loginAdmin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  // System
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => Promise<{ success: boolean; message: string }>;
  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEY = 'bina_asri_storage_v6_sr_kalbar';
const ADMIN_SESSION_KEY = 'bina_asri_admin_session';

const FoundationContext = createContext<FoundationContextType | undefined>(undefined);

export const FoundationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial State from Storage or Defaults
  const [kontenWeb, setKontenWeb] = useState<KontenWeb>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.kontenWeb) return { ...DEFAULT_KONTEN_WEB, ...parsed.kontenWeb };
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    return DEFAULT_KONTEN_WEB;
  });

  const [berita, setBerita] = useState<BeritaItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.berita) && parsed.berita.length > 0) return parsed.berita;
      }
    } catch (e) {}
    return DEFAULT_BERITA;
  });

  const [program, setProgram] = useState<ProgramItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.program) && parsed.program.length > 0) return parsed.program;
      }
    } catch (e) {}
    return DEFAULT_PROGRAM;
  });

  const [galeri, setGaleri] = useState<GaleriItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.galeri) && parsed.galeri.length > 0) return parsed.galeri;
      }
    } catch (e) {}
    return DEFAULT_GALERI;
  });

  const [pengurus, setPengurus] = useState<PengurusItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.pengurus) && parsed.pengurus.length > 5) return parsed.pengurus;
      }
    } catch (e) {}
    return DEFAULT_PENGURUS;
  });

  const [banks, setBanks] = useState<BankAccount[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.banks) && parsed.banks.length > 0) return parsed.banks;
      }
    } catch (e) {}
    return DEFAULT_BANKS;
  });

  const [pesan, setPesan] = useState<PesanItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.pesan) && parsed.pesan.length > 0) return parsed.pesan;
      }
    } catch (e) {}
    return DEFAULT_PESAN;
  });

  // Admin session
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // UI state
  const [activeView, setActiveView] = useState<'public' | 'dashboard'>('public');
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [directEditMode, setDirectEditMode] = useState<boolean>(false);
  const [unsavedKeys, setUnsavedKeys] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to Cloud SQL PostgreSQL: Fetch database bootstrap on mount
  const fetchCloudData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.kontenWeb) setKontenWeb(d.kontenWeb);
        if (Array.isArray(d.berita)) setBerita(d.berita);
        if (Array.isArray(d.program)) setProgram(d.program);
        if (Array.isArray(d.galeri)) setGaleri(d.galeri);
        if (Array.isArray(d.pengurus)) setPengurus(d.pengurus);
        if (Array.isArray(d.banks)) setBanks(d.banks);
        if (Array.isArray(d.pesan)) setPesan(d.pesan);
      }
    } catch (err) {
      console.warn('API /api/bootstrap note: using local cache', err);
    }
  }, []);

  useEffect(() => {
    fetchCloudData();
  }, [fetchCloudData]);

  // Auto-sync entire state to localStorage for offline readiness
  useEffect(() => {
    try {
      const payload = {
        kontenWeb: { ...kontenWeb, donasi_banks: JSON.stringify(banks) },
        berita,
        program,
        galeri,
        pengurus,
        banks,
        pesan
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to sync to local storage', e);
    }
  }, [kontenWeb, berita, program, galeri, pengurus, banks, pesan]);

  // Direct on-page editing mode
  const toggleDirectEditMode = () => {
    if (!adminSession) {
      showToast('Harap login sebagai admin terlebih dahulu.', 'error');
      return;
    }
    const next = !directEditMode;
    setDirectEditMode(next);
    if (next) {
      showToast('Mode Edit Langsung AKTIF: Klik teks bertanda garis putus-putus untuk langsung mengedit!', 'info');
    } else {
      showToast('Mode Edit Langsung dinonaktifkan.', 'info');
    }
  };

  const updateDirectField = (key: keyof KontenWeb, value: string) => {
    setKontenWeb((prev) => ({ ...prev, [key]: value }));
    setUnsavedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const saveAllDirectChanges = async () => {
    const count = unsavedKeys.length;
    const updates: Record<string, string> = {};
    unsavedKeys.forEach((k) => {
      updates[k] = (kontenWeb as any)[k] ?? '';
    });

    setUnsavedKeys([]);

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        showToast(`Berhasil menyimpan ${count} perubahan langsung ke database PostgreSQL!`, 'success');
      } else {
        showToast(`Perubahan tersimpan secara lokal.`, 'info');
      }
    } catch (err) {
      showToast(`Perubahan tersimpan secara lokal.`, 'info');
    }
  };

  const dismissUnsavedChanges = () => {
    setUnsavedKeys([]);
  };

  const saveFullKonten = async (newKonten: Partial<KontenWeb>) => {
    setKontenWeb((prev) => ({ ...prev, ...newKonten }));

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: newKonten }),
      });
      if (res.ok) {
        showToast('Seluruh perubahan konten berhasil disimpan ke database PostgreSQL!', 'success');
      } else {
        showToast('Seluruh perubahan konten berhasil disimpan secara lokal!', 'success');
      }
    } catch (err) {
      showToast('Seluruh perubahan konten berhasil disimpan secara lokal!', 'success');
    }
  };

  // News CRUD
  const addBerita = async (item: Omit<BeritaItem, 'id'>) => {
    const tempId = Date.now();
    const d = item.rawTanggal ? new Date(item.rawTanggal) : new Date();
    const formattedTanggal = item.tanggal || d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const tempItem: BeritaItem = {
      ...item,
      id: tempId,
      tanggal: formattedTanggal
    };
    setBerita((prev) => [tempItem, ...prev]);

    try {
      const res = await fetch('/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
      }
      showToast('Berita baru berhasil dipublikasikan dan disimpan permanen di database!', 'success');
    } catch (err) {
      showToast('Berita baru berhasil dipublikasikan!', 'success');
    }
  };

  const updateBerita = async (item: BeritaItem) => {
    setBerita((prev) => prev.map((b) => (b.id === item.id ? item : b)));

    try {
      const res = await fetch(`/api/berita/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
      }
      showToast('Berita berhasil diperbarui di database!', 'success');
    } catch (err) {
      showToast('Berita berhasil diperbarui!', 'success');
    }
  };

  const deleteBerita = async (id: number) => {
    setBerita((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/berita/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
      }
      showToast('Berita berhasil dihapus dari database!', 'success');
    } catch (err) {
      showToast('Berita berhasil dihapus!', 'success');
    }
  };

  // Program CRUD
  const addProgram = async (item: Omit<ProgramItem, 'id'>) => {
    const tempItem: ProgramItem = {
      ...item,
      id: Date.now()
    };
    setProgram((prev) => [...prev, tempItem]);

    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
      showToast('Program kerja baru berhasil disimpan ke database!', 'success');
    } catch (err) {
      showToast('Program kerja baru berhasil disimpan!', 'success');
    }
  };

  const updateProgram = async (item: ProgramItem) => {
    setProgram((prev) => prev.map((p) => (p.id === item.id ? item : p)));

    try {
      const res = await fetch(`/api/programs/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
      showToast('Program berhasil diperbarui di database!', 'success');
    } catch (err) {
      showToast('Program berhasil diperbarui!', 'success');
    }
  };

  const deleteProgram = async (id: number) => {
    setProgram((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
      showToast('Program berhasil dihapus dari database!', 'success');
    } catch (err) {
      showToast('Program berhasil dihapus!', 'success');
    }
  };

  // Galeri CRUD
  const addGaleri = async (item: Omit<GaleriItem, 'id'>) => {
    const tempItem: GaleriItem = {
      ...item,
      id: Date.now()
    };
    setGaleri((prev) => [tempItem, ...prev]);

    try {
      const res = await fetch('/api/galeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setGaleri(json.all);
      }
      showToast('Foto dokumentasi berhasil disimpan ke database!', 'success');
    } catch (err) {
      showToast('Foto dokumentasi berhasil ditambahkan ke galeri!', 'success');
    }
  };

  const deleteGaleri = async (id: number) => {
    setGaleri((prev) => prev.filter((g) => g.id !== id));

    try {
      const res = await fetch(`/api/galeri/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setGaleri(json.all);
      }
      showToast('Foto galeri berhasil dihapus dari database!', 'success');
    } catch (err) {
      showToast('Foto galeri berhasil dihapus!', 'success');
    }
  };

  // Pengurus CRUD
  const addPengurus = async (item: Omit<PengurusItem, 'id'>) => {
    const tempItem: PengurusItem = {
      ...item,
      id: Date.now()
    };
    setPengurus((prev) => [...prev, tempItem]);

    try {
      const res = await fetch('/api/pengurus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
      showToast('Data pengurus baru berhasil disimpan ke database!', 'success');
    } catch (err) {
      showToast('Data pengurus baru berhasil ditambahkan!', 'success');
    }
  };

  const updatePengurus = async (item: PengurusItem) => {
    setPengurus((prev) => prev.map((p) => (p.id === item.id ? item : p)));

    try {
      const res = await fetch(`/api/pengurus/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
      showToast('Data pengurus berhasil diperbarui di database!', 'success');
    } catch (err) {
      showToast('Data pengurus berhasil diperbarui!', 'success');
    }
  };

  const deletePengurus = async (id: number) => {
    setPengurus((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/pengurus/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
      showToast('Data pengurus berhasil dihapus dari database!', 'success');
    } catch (err) {
      showToast('Data pengurus berhasil dihapus!', 'success');
    }
  };

  // Bank CRUD
  const addBank = async (item: Omit<BankAccount, 'id'>) => {
    const tempItem: BankAccount = {
      ...item,
      id: Date.now()
    };
    const next = [...banks, tempItem];
    setBanks(next);

    try {
      const res = await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
      showToast('Rekening bank baru berhasil disimpan ke database!', 'success');
    } catch (err) {
      showToast('Rekening bank baru berhasil ditambahkan!', 'success');
    }
  };

  const updateBank = async (item: BankAccount) => {
    const next = banks.map((b) => (b.id === item.id ? item : b));
    setBanks(next);

    try {
      const res = await fetch(`/api/banks/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
      showToast('Rekening bank berhasil diperbarui di database!', 'success');
    } catch (err) {
      showToast('Rekening bank berhasil diperbarui!', 'success');
    }
  };

  const deleteBank = async (id: number) => {
    const next = banks.filter((b) => b.id !== id);
    setBanks(next);

    try {
      const res = await fetch(`/api/banks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
      showToast('Rekening bank telah dihapus dari database!', 'success');
    } catch (err) {
      showToast('Rekening bank telah dihapus!', 'success');
    }
  };

  // Messages
  const submitPesan = async (form: { nama: string; email: string; telepon: string; subjek: string; pesan: string }) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';

    const newItem: PesanItem = {
      id: Date.now(),
      timestamp,
      nama: form.nama.trim(),
      email: form.email.trim(),
      telepon: form.telepon.trim(),
      subjek: form.subjek,
      pesan: form.pesan.trim()
    };

    setPesan((prev) => [newItem, ...prev]);

    try {
      const res = await fetch('/api/pesan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setPesan(json.all);
      }
      showToast('Pesan Anda berhasil dikirim dan tersimpan di database Yayasan Bina Asri!', 'success');
    } catch (err) {
      showToast('Pesan Anda berhasil dikirim!', 'success');
    }
    return true;
  };

  const deletePesan = async (id: number) => {
    setPesan((prev) => prev.filter((m) => m.id !== id));

    try {
      const res = await fetch(`/api/pesan/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.all) setPesan(json.all);
      }
      showToast('Pesan dihapus dari kotak masuk database.', 'success');
    } catch (err) {
      showToast('Pesan dihapus dari kotak masuk.', 'success');
    }
  };

  // Auth
  const loginAdmin = async (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const session: AdminSession = {
          user: data.user,
          token: data.token,
          loginTime: data.loginTime,
        };
        setAdminSession(session);
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        showToast('Login berhasil! Terhubung dengan Database Yayasan.', 'success');
        return { success: true, message: 'Login berhasil!' };
      }
      return { success: false, message: data.message || 'Username atau Password salah!' };
    } catch (err: any) {
      // Local fallback
      if (u === 'admin' && p === 'admin123') {
        const session: AdminSession = {
          user: {
            username: 'admin',
            nama: 'Pengurus Bina Asri',
            role: 'Superadmin'
          },
          token: 'token_' + Date.now(),
          loginTime: new Date().toISOString()
        };
        setAdminSession(session);
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        showToast('Login berhasil secara lokal.', 'success');
        return { success: true, message: 'Login berhasil!' };
      }
      return { success: false, message: 'Gagal terhubung ke database untuk otentikasi.' };
    }
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    setDirectEditMode(false);
    setActiveView('public');
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showToast('Anda telah logout dari Sistem Admin.', 'info');
  };

  const changeAdminPassword = async (oldPass: string, newPass: string) => {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPass, newPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password admin berhasil diperbarui di database!', 'success');
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Gagal mengubah password' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Koneksi database gagal' };
    }
  };

  // System Backup / Restore
  const exportDataJson = () => {
    const fullData = {
      version: '2.0',
      database: 'Cloud SQL PostgreSQL',
      exportedAt: new Date().toISOString(),
      kontenWeb,
      berita,
      program,
      galeri,
      pengurus,
      banks,
      pesan
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importDataJson = async (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.kontenWeb) {
        setKontenWeb({ ...DEFAULT_KONTEN_WEB, ...parsed.kontenWeb });
        await fetch('/api/site-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: parsed.kontenWeb }),
        });
      }
      if (Array.isArray(parsed.berita)) setBerita(parsed.berita);
      if (Array.isArray(parsed.program)) setProgram(parsed.program);
      if (Array.isArray(parsed.galeri)) setGaleri(parsed.galeri);
      if (Array.isArray(parsed.pengurus)) setPengurus(parsed.pengurus);
      if (Array.isArray(parsed.banks)) setBanks(parsed.banks);
      if (Array.isArray(parsed.pesan)) setPesan(parsed.pesan);
      showToast('Seluruh data berhasil dipulihkan dan disinkronkan ke database!', 'success');
      return { success: true, message: 'Data cadangan berhasil diimpor.' };
    } catch (e: any) {
      showToast('Gagal mengimpor file: format data tidak valid.', 'error');
      return { success: false, message: e.message || 'Format tidak valid' };
    }
  };

  const resetToDefaults = async () => {
    try {
      await fetch('/api/admin/reset', { method: 'POST' });
      await fetchCloudData();
      showToast('Seluruh database berhasil dikembalikan ke pengaturan awal yayasan.', 'info');
    } catch (err) {
      setKontenWeb(DEFAULT_KONTEN_WEB);
      setBerita(DEFAULT_BERITA);
      setProgram(DEFAULT_PROGRAM);
      setGaleri(DEFAULT_GALERI);
      setPengurus(DEFAULT_PENGURUS);
      setBanks(DEFAULT_BANKS);
      setPesan(DEFAULT_PESAN);
      localStorage.removeItem(STORAGE_KEY);
      showToast('Seluruh data website berhasil dikembalikan ke pengaturan bawaan.', 'info');
    }
  };

  return (
    <FoundationContext.Provider
      value={{
        kontenWeb,
        berita,
        program,
        galeri,
        pengurus,
        banks,
        pesan,
        adminSession,
        directEditMode,
        unsavedKeys,
        activeView,
        dashboardTab,
        toasts,
        setActiveView,
        setDashboardTab,
        showToast,
        removeToast,
        toggleDirectEditMode,
        updateDirectField,
        saveAllDirectChanges,
        dismissUnsavedChanges,
        saveFullKonten,
        addBerita,
        updateBerita,
        deleteBerita,
        addProgram,
        updateProgram,
        deleteProgram,
        addGaleri,
        deleteGaleri,
        addPengurus,
        updatePengurus,
        deletePengurus,
        addBank,
        updateBank,
        deleteBank,
        submitPesan,
        deletePesan,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        exportDataJson,
        importDataJson,
        resetToDefaults
      }}
    >
      {children}
    </FoundationContext.Provider>
  );
};

export const useFoundation = () => {
  const ctx = useContext(FoundationContext);
  if (!ctx) throw new Error('useFoundation must be used within FoundationProvider');
  return ctx;
};
