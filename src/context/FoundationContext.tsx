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
import { getSupabaseClient } from '../lib/supabase';

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
  fetchCloudData: () => Promise<void>;
  syncLocalToSupabaseClient: () => Promise<{ success: boolean; message: string; counts?: Record<string, number> }>;
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

  // Sync / Fetch data from Cloud Database (Hybrid API + Supabase fallback)
  const fetchCloudData = useCallback(async () => {
    let loadedFromApi = false;

    // 1. Try Express backend endpoint
    try {
      const res = await fetch('/api/bootstrap');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
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
          loadedFromApi = true;
        }
      }
    } catch (err) {
      console.warn('API /api/bootstrap note: trying client-side resolution...', err);
    }

    // 2. If backend endpoint was not available (e.g., pure static Vercel build), connect directly to Supabase
    if (!loadedFromApi) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          console.log('Connecting directly to Supabase PostgreSQL from browser client...');
          const [resContent, resBerita, resProg, resGal, resPeng, resBanks, resPesan] = await Promise.all([
            supabase.from('site_content').select('*'),
            supabase.from('berita').select('*').order('id', { ascending: false }),
            supabase.from('programs').select('*').order('id', { ascending: false }),
            supabase.from('galeri').select('*').order('id', { ascending: false }),
            supabase.from('pengurus').select('*').order('id', { ascending: true }),
            supabase.from('banks').select('*').order('id', { ascending: true }),
            supabase.from('pesan').select('*').order('id', { ascending: false }),
          ]);

          if (!resContent.error && resContent.data && resContent.data.length > 0) {
            const map: Record<string, string> = {};
            resContent.data.forEach((r: any) => { map[r.key] = r.value; });
            setKontenWeb((prev) => ({ ...prev, ...map }));
          }
          if (!resBerita.error && resBerita.data && resBerita.data.length > 0) {
            setBerita(resBerita.data.map((r: any) => ({
              id: Number(r.id),
              judul: r.judul,
              tanggal: r.tanggal,
              rawTanggal: r.raw_tanggal || r.tanggal,
              kategori: r.kategori,
              ringkasan: r.ringkasan,
              konten: r.konten,
              gambar: r.gambar,
            })));
          }
          if (!resProg.error && resProg.data && resProg.data.length > 0) {
            setProgram(resProg.data.map((r: any) => ({
              id: Number(r.id),
              nama: r.nama,
              deskripsi: r.deskripsi,
              target: r.target,
              progress: Number(r.progress) || 0,
            })));
          }
          if (!resGal.error && resGal.data && resGal.data.length > 0) {
            setGaleri(resGal.data.map((r: any) => ({
              id: Number(r.id),
              judul: r.judul,
              gambar: r.gambar,
            })));
          }
          if (!resPeng.error && resPeng.data && resPeng.data.length > 0) {
            setPengurus(resPeng.data.map((r: any) => ({
              id: Number(r.id),
              nama: r.nama,
              jabatan: r.jabatan,
              foto: r.foto,
              cabang: r.cabang,
              kontak: r.kontak || undefined,
            })));
          }
          if (!resBanks.error && resBanks.data && resBanks.data.length > 0) {
            setBanks(resBanks.data.map((r: any) => ({
              id: Number(r.id),
              bank: r.bank,
              badge: r.badge,
              norek: r.norek,
              an: r.an,
            })));
          }
          if (!resPesan.error && resPesan.data) {
            setPesan(resPesan.data.map((r: any) => ({
              id: Number(r.id),
              timestamp: r.timestamp,
              nama: r.nama,
              email: r.email || '',
              telepon: r.telepon,
              subjek: r.subjek,
              pesan: r.pesan,
            })));
          }
        } catch (supErr) {
          console.warn('Client Supabase direct fetch error:', supErr);
        }
      }
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

    let savedRemote = false;

    // 1. Try Backend API
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        savedRemote = true;
      }
    } catch {}

    // 2. Direct Supabase Fallback
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const rows = Object.entries(updates).map(([key, value]) => ({
          key,
          value: String(value ?? ''),
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('site_content').upsert(rows);
        if (!error) savedRemote = true;
      } catch (err) {
        console.warn('Supabase direct direct-changes error:', err);
      }
    }

    if (savedRemote) {
      showToast(`Berhasil menyimpan ${count} perubahan teks ke Database!`, 'success');
    } else {
      showToast(`Perubahan tersimpan secara lokal di perangkat Anda.`, 'info');
    }
  };

  const dismissUnsavedChanges = () => {
    setUnsavedKeys([]);
  };

  const saveFullKonten = async (newKonten: Partial<KontenWeb>) => {
    setKontenWeb((prev) => ({ ...prev, ...newKonten }));

    let savedRemote = false;

    // 1. Try Backend API
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: newKonten }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        savedRemote = true;
      }
    } catch {}

    // 2. Direct Supabase Fallback
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const rows = Object.entries(newKonten).map(([key, value]) => ({
          key,
          value: String(value ?? ''),
          updated_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from('site_content').upsert(rows);
        if (!error) savedRemote = true;
      } catch (err) {
        console.warn('Supabase direct saveFullKonten error:', err);
      }
    }

    if (savedRemote) {
      showToast('Seluruh perubahan konten berhasil disimpan ke Database Cloud!', 'success');
    } else {
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

    let savedRemote = false;

    try {
      const res = await fetch('/api/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempItem),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
        savedRemote = true;
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('berita').insert({
          id: tempItem.id,
          judul: tempItem.judul,
          tanggal: tempItem.tanggal,
          raw_tanggal: tempItem.rawTanggal || tempItem.tanggal,
          kategori: tempItem.kategori,
          ringkasan: tempItem.ringkasan,
          konten: tempItem.konten,
          gambar: tempItem.gambar,
        });
        if (!error) savedRemote = true;
      } catch (e) {
        console.warn('Supabase direct addBerita note:', e);
      }
    }

    showToast(
      savedRemote
        ? 'Berita baru berhasil dipublikasikan dan tersimpan di database!'
        : 'Berita baru berhasil dipublikasikan secara lokal!',
      'success'
    );
  };

  const updateBerita = async (item: BeritaItem) => {
    setBerita((prev) => prev.map((b) => (b.id === item.id ? item : b)));

    let savedRemote = false;

    try {
      const res = await fetch(`/api/berita/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
        savedRemote = true;
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('berita').update({
          judul: item.judul,
          tanggal: item.tanggal,
          raw_tanggal: item.rawTanggal || item.tanggal,
          kategori: item.kategori,
          ringkasan: item.ringkasan,
          konten: item.konten,
          gambar: item.gambar,
        }).eq('id', item.id);
        if (!error) savedRemote = true;
      } catch (e) {
        console.warn('Supabase direct updateBerita note:', e);
      }
    }

    showToast('Berita berhasil diperbarui!', 'success');
  };

  const deleteBerita = async (id: number) => {
    setBerita((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetch(`/api/berita/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBerita(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('berita').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Berita berhasil dihapus!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('programs').insert({
          id: tempItem.id,
          nama: tempItem.nama,
          deskripsi: tempItem.deskripsi,
          target: tempItem.target,
          progress: tempItem.progress,
        });
      } catch (e) {}
    }

    showToast('Program kerja berhasil disimpan!', 'success');
  };

  const updateProgram = async (item: ProgramItem) => {
    setProgram((prev) => prev.map((p) => (p.id === item.id ? item : p)));

    try {
      const res = await fetch(`/api/programs/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('programs').update({
          nama: item.nama,
          deskripsi: item.deskripsi,
          target: item.target,
          progress: item.progress,
        }).eq('id', item.id);
      } catch (e) {}
    }

    showToast('Program berhasil diperbarui!', 'success');
  };

  const deleteProgram = async (id: number) => {
    setProgram((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setProgram(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('programs').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Program berhasil dihapus!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setGaleri(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('galeri').insert({
          id: tempItem.id,
          judul: tempItem.judul,
          gambar: tempItem.gambar,
        });
      } catch (e) {}
    }

    showToast('Foto dokumentasi berhasil disimpan!', 'success');
  };

  const deleteGaleri = async (id: number) => {
    setGaleri((prev) => prev.filter((g) => g.id !== id));

    try {
      const res = await fetch(`/api/galeri/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setGaleri(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('galeri').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Foto galeri berhasil dihapus!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('pengurus').insert({
          id: tempItem.id,
          nama: tempItem.nama,
          jabatan: tempItem.jabatan,
          foto: tempItem.foto,
          cabang: tempItem.cabang,
          kontak: tempItem.kontak || '',
        });
      } catch (e) {}
    }

    showToast('Data pengurus berhasil ditambahkan!', 'success');
  };

  const updatePengurus = async (item: PengurusItem) => {
    setPengurus((prev) => prev.map((p) => (p.id === item.id ? item : p)));

    try {
      const res = await fetch(`/api/pengurus/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('pengurus').update({
          nama: item.nama,
          jabatan: item.jabatan,
          foto: item.foto,
          cabang: item.cabang,
          kontak: item.kontak || '',
        }).eq('id', item.id);
      } catch (e) {}
    }

    showToast('Data pengurus berhasil diperbarui!', 'success');
  };

  const deletePengurus = async (id: number) => {
    setPengurus((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/pengurus/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setPengurus(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('pengurus').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Data pengurus berhasil dihapus!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('banks').insert({
          id: tempItem.id,
          bank: tempItem.bank,
          badge: tempItem.badge,
          norek: tempItem.norek,
          an: tempItem.an,
        });
      } catch (e) {}
    }

    showToast('Rekening bank baru berhasil disimpan!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('banks').update({
          bank: item.bank,
          badge: item.badge,
          norek: item.norek,
          an: item.an,
        }).eq('id', item.id);
      } catch (e) {}
    }

    showToast('Rekening bank berhasil diperbarui!', 'success');
  };

  const deleteBank = async (id: number) => {
    const next = banks.filter((b) => b.id !== id);
    setBanks(next);

    try {
      const res = await fetch(`/api/banks/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setBanks(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('banks').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Rekening bank telah dihapus!', 'success');
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
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setPesan(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('pesan').insert({
          id: newItem.id,
          timestamp: newItem.timestamp,
          nama: newItem.nama,
          email: newItem.email || '',
          telepon: newItem.telepon,
          subjek: newItem.subjek,
          pesan: newItem.pesan,
        });
      } catch (e) {}
    }

    showToast('Pesan Anda berhasil dikirim dan tersimpan!', 'success');
    return true;
  };

  const deletePesan = async (id: number) => {
    setPesan((prev) => prev.filter((m) => m.id !== id));

    try {
      const res = await fetch(`/api/pesan/${id}`, { method: 'DELETE' });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const json = await res.json();
        if (json.all) setPesan(json.all);
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('pesan').delete().eq('id', id);
      } catch (e) {}
    }

    showToast('Pesan dihapus dari kotak masuk.', 'success');
  };

  // Auth
  const loginAdmin = async (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Try server endpoint
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data.success) {
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
      }
    } catch {}

    // 2. Direct Supabase credential check
    const supabase = getSupabaseClient();
    let expectedPass = 'admin123';
    if (supabase) {
      try {
        const { data } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
        if (data && data.value) {
          expectedPass = data.value;
        }
      } catch {}
    }

    if ((u === 'admin' || u === 'yayasan') && p === expectedPass) {
      const session: AdminSession = {
        user: {
          username: u,
          nama: 'Administrator Yayasan Bina Asri',
          role: 'Superadmin'
        },
        token: 'token_' + Date.now(),
        loginTime: new Date().toISOString()
      };
      setAdminSession(session);
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      showToast('Login berhasil!', 'success');
      return { success: true, message: 'Login berhasil!' };
    }

    return { success: false, message: 'Username atau Password salah!' };
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    setDirectEditMode(false);
    setActiveView('public');
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showToast('Anda telah logout dari Sistem Admin.', 'info');
  };

  const changeAdminPassword = async (oldPass: string, newPass: string) => {
    let success = false;
    let message = 'Gagal mengubah password';

    // 1. Try server endpoint
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPass, newPass }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data.success) {
          success = true;
          message = data.message;
        }
      }
    } catch {}

    // 2. Direct Supabase Fallback
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
        const currentDbPass = data?.value || 'admin123';
        if (oldPass !== currentDbPass) {
          return { success: false, message: 'Kata sandi lama tidak cocok!' };
        }
        const { error } = await supabase.from('admin_settings').upsert({
          key: 'admin_password',
          value: newPass,
          updated_at: new Date().toISOString(),
        });
        if (!error) {
          success = true;
          message = 'Kata sandi admin berhasil diperbarui di Supabase!';
        }
      } catch (e: any) {
        console.warn('Supabase password change note:', e);
      }
    }

    if (success) {
      showToast('Password admin berhasil diperbarui!', 'success');
      return { success: true, message: 'Password berhasil diperbarui!' };
    }

    return { success: false, message };
  };

  // Client-side full sync to Supabase
  const syncLocalToSupabaseClient = async (): Promise<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        message: 'Klien Supabase belum dikonfigurasi. Harap masukkan SUPABASE_URL dan API Key terlebih dahulu.',
      };
    }

    const counts: Record<string, number> = {};

    try {
      // 1. Site content
      const contentRows = Object.entries(kontenWeb).map(([key, value]) => ({
        key,
        value: String(value ?? ''),
        updated_at: new Date().toISOString(),
      }));
      if (contentRows.length > 0) {
        const { error } = await supabase.from('site_content').upsert(contentRows);
        if (error) throw new Error(`Tabel site_content: ${error.message}`);
        counts['site_content'] = contentRows.length;
      }

      // 2. Berita
      if (berita.length > 0) {
        const rows = berita.map((b) => ({
          id: b.id,
          judul: b.judul,
          tanggal: b.tanggal,
          raw_tanggal: b.rawTanggal || b.tanggal,
          kategori: b.kategori,
          ringkasan: b.ringkasan,
          konten: b.konten,
          gambar: b.gambar,
        }));
        const { error } = await supabase.from('berita').upsert(rows);
        if (error) throw new Error(`Tabel berita: ${error.message}`);
        counts['berita'] = rows.length;
      }

      // 3. Programs
      if (program.length > 0) {
        const rows = program.map((p) => ({
          id: p.id,
          nama: p.nama,
          deskripsi: p.deskripsi,
          target: p.target,
          progress: p.progress,
        }));
        const { error } = await supabase.from('programs').upsert(rows);
        if (error) throw new Error(`Tabel programs: ${error.message}`);
        counts['programs'] = rows.length;
      }

      // 4. Galeri
      if (galeri.length > 0) {
        const rows = galeri.map((g) => ({
          id: g.id,
          judul: g.judul,
          gambar: g.gambar,
        }));
        const { error } = await supabase.from('galeri').upsert(rows);
        if (error) throw new Error(`Tabel galeri: ${error.message}`);
        counts['galeri'] = rows.length;
      }

      // 5. Pengurus
      if (pengurus.length > 0) {
        const rows = pengurus.map((pg) => ({
          id: pg.id,
          nama: pg.nama,
          jabatan: pg.jabatan,
          foto: pg.foto,
          cabang: pg.cabang,
          kontak: pg.kontak || '',
        }));
        const { error } = await supabase.from('pengurus').upsert(rows);
        if (error) throw new Error(`Tabel pengurus: ${error.message}`);
        counts['pengurus'] = rows.length;
      }

      // 6. Banks
      if (banks.length > 0) {
        const rows = banks.map((bk) => ({
          id: bk.id,
          bank: bk.bank,
          badge: bk.badge,
          norek: bk.norek,
          an: bk.an,
        }));
        const { error } = await supabase.from('banks').upsert(rows);
        if (error) throw new Error(`Tabel banks: ${error.message}`);
        counts['banks'] = rows.length;
      }

      // 7. Pesan
      if (pesan.length > 0) {
        const rows = pesan.map((ps) => ({
          id: ps.id,
          timestamp: ps.timestamp,
          nama: ps.nama,
          email: ps.email || '',
          telepon: ps.telepon,
          subjek: ps.subjek,
          pesan: ps.pesan,
        }));
        const { error } = await supabase.from('pesan').upsert(rows);
        if (error) throw new Error(`Tabel pesan: ${error.message}`);
        counts['pesan'] = rows.length;
      }

      return {
        success: true,
        message: 'Seluruh data Yayasan berhasil disinkronkan ke Supabase!',
        counts,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal sinkronisasi ke Supabase',
      };
    }
  };

  // System Backup / Restore
  const exportDataJson = () => {
    const fullData = {
      version: '2.0',
      database: 'Supabase PostgreSQL & Local Cache',
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
        await saveFullKonten(parsed.kontenWeb);
      }
      if (Array.isArray(parsed.berita)) setBerita(parsed.berita);
      if (Array.isArray(parsed.program)) setProgram(parsed.program);
      if (Array.isArray(parsed.galeri)) setGaleri(parsed.galeri);
      if (Array.isArray(parsed.pengurus)) setPengurus(parsed.pengurus);
      if (Array.isArray(parsed.banks)) setBanks(parsed.banks);
      if (Array.isArray(parsed.pesan)) setPesan(parsed.pesan);
      showToast('Seluruh data berhasil dipulihkan dan disinkronkan!', 'success');
      return { success: true, message: 'Data cadangan berhasil diimpor.' };
    } catch (e: any) {
      showToast('Gagal mengimpor file: format data tidak valid.', 'error');
      return { success: false, message: e.message || 'Format tidak valid' };
    }
  };

  const resetToDefaults = async () => {
    setKontenWeb(DEFAULT_KONTEN_WEB);
    setBerita(DEFAULT_BERITA);
    setProgram(DEFAULT_PROGRAM);
    setGaleri(DEFAULT_GALERI);
    setPengurus(DEFAULT_PENGURUS);
    setBanks(DEFAULT_BANKS);
    setPesan(DEFAULT_PESAN);
    localStorage.removeItem(STORAGE_KEY);

    try {
      await fetch('/api/admin/reset', { method: 'POST' });
    } catch {}

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await syncLocalToSupabaseClient();
      } catch (err) {
        console.warn('Supabase reset sync notice:', err);
      }
    }

    showToast('Seluruh data website berhasil dikembalikan ke pengaturan bawaan.', 'info');
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
        resetToDefaults,
        fetchCloudData,
        syncLocalToSupabaseClient,
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
