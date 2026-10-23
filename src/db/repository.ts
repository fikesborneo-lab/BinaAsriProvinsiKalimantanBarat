import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_KONTEN_WEB,
  DEFAULT_BERITA,
  DEFAULT_PROGRAM,
  DEFAULT_GALERI,
  DEFAULT_PENGURUS,
  DEFAULT_BANKS,
  DEFAULT_PESAN,
  DEFAULT_USERS,
} from '../data/defaultData.ts';
import type {
  KontenWeb,
  BeritaItem,
  ProgramItem,
  GaleriItem,
  PengurusItem,
  BankAccount,
  PesanItem,
  AppUser,
} from '../types/index.ts';
import { getSupabaseClient } from '../lib/supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_FILE_PATH = isServerless
  ? path.resolve('/tmp', 'foundation_db.json')
  : path.resolve(__dirname, '../../data/foundation_db.json');

export interface DatabaseSchema {
  kontenWeb: KontenWeb;
  berita: BeritaItem[];
  program: ProgramItem[];
  galeri: GaleriItem[];
  pengurus: PengurusItem[];
  banks: BankAccount[];
  pesan: PesanItem[];
  adminPassword: string;
  users: AppUser[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    kontenWeb: { ...DEFAULT_KONTEN_WEB },
    berita: [...DEFAULT_BERITA],
    program: [...DEFAULT_PROGRAM],
    galeri: [...DEFAULT_GALERI],
    pengurus: [...DEFAULT_PENGURUS],
    banks: [...DEFAULT_BANKS],
    pesan: [...DEFAULT_PESAN],
    adminPassword: 'admin123',
    users: [...DEFAULT_USERS],
  };
}

let inMemoryDb: DatabaseSchema | null = null;

function ensureDbLoaded(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryDb = {
        kontenWeb: { ...DEFAULT_KONTEN_WEB, ...(parsed.kontenWeb || {}) },
        berita: Array.isArray(parsed.berita) && parsed.berita.length > 0 ? parsed.berita : [...DEFAULT_BERITA],
        program: Array.isArray(parsed.program) && parsed.program.length > 0 ? parsed.program : [...DEFAULT_PROGRAM],
        galeri: Array.isArray(parsed.galeri) && parsed.galeri.length > 0 ? parsed.galeri : [...DEFAULT_GALERI],
        pengurus: Array.isArray(parsed.pengurus) && parsed.pengurus.length > 0 ? parsed.pengurus : [...DEFAULT_PENGURUS],
        banks: Array.isArray(parsed.banks) && parsed.banks.length > 0 ? parsed.banks : [...DEFAULT_BANKS],
        pesan: Array.isArray(parsed.pesan) ? parsed.pesan : [...DEFAULT_PESAN],
        adminPassword: parsed.adminPassword || 'admin123',
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : [...DEFAULT_USERS],
      };
      return inMemoryDb;
    }
  } catch (err) {
    console.warn('Could not read existing foundation_db.json, initializing defaults:', err);
  }

  inMemoryDb = getInitialDatabase();
  persistDbToFile(inMemoryDb);
  return inMemoryDb;
}

function persistDbToFile(db: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// 1. Initial Seeding helper
export async function seedDefaultsIfEmpty(): Promise<void> {
  ensureDbLoaded();
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // Check if site_content is empty in Supabase
      const { data, error } = await supabase.from('site_content').select('key').limit(1);
      if (!error && (!data || data.length === 0)) {
        console.log('Supabase tables detected empty, auto-syncing initial data...');
        await syncLocalToSupabase();
      }
    } catch (e) {
      console.warn('Supabase initial check notice:', e);
    }
  }
}

// 2. Site Content
export async function getSiteContent(): Promise<KontenWeb> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('site_content').select('*');
      if (!error && data && data.length > 0) {
        const contentMap: Record<string, string> = {};
        for (const row of data) {
          contentMap[row.key] = row.value;
        }
        const merged = { ...DEFAULT_KONTEN_WEB, ...contentMap } as KontenWeb;
        // Keep local cache synced
        const db = ensureDbLoaded();
        db.kontenWeb = merged;
        persistDbToFile(db);
        return merged;
      }
    } catch (err) {
      console.warn('Supabase fetch site_content notice, fallback to local:', err);
    }
  }

  const db = ensureDbLoaded();
  return db.kontenWeb;
}

export async function updateSiteContentField(key: string, value: string): Promise<void> {
  const db = ensureDbLoaded();
  (db.kontenWeb as any)[key] = value;
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('site_content').upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase updateSiteContentField notice:', err);
    }
  }
}

export async function bulkUpdateSiteContent(entries: Record<string, string>): Promise<void> {
  const db = ensureDbLoaded();
  const upsertRows = Object.entries(entries).map(([key, value]) => {
    (db.kontenWeb as any)[key] = value;
    return {
      key,
      value: String(value ?? ''),
      updated_at: new Date().toISOString(),
    };
  });
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase && upsertRows.length > 0) {
    try {
      await supabase.from('site_content').upsert(upsertRows);
    } catch (err) {
      console.warn('Supabase bulkUpdateSiteContent notice:', err);
    }
  }
}

// 3. Berita CRUD
export async function getAllBerita(): Promise<BeritaItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('berita').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted: BeritaItem[] = data.map((r: any) => ({
          id: Number(r.id),
          judul: r.judul,
          tanggal: r.tanggal,
          rawTanggal: r.raw_tanggal || r.tanggal,
          kategori: r.kategori,
          ringkasan: r.ringkasan,
          konten: r.konten,
          gambar: r.gambar,
        }));
        const db = ensureDbLoaded();
        db.berita = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllBerita notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.berita];
}

export async function createBerita(item: Omit<BeritaItem, 'id'>): Promise<BeritaItem> {
  const newId = Date.now();
  const newItem: BeritaItem = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.berita = [newItem, ...db.berita];
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('berita').insert({
        id: newId,
        judul: item.judul,
        tanggal: item.tanggal,
        raw_tanggal: item.rawTanggal || item.tanggal,
        kategori: item.kategori,
        ringkasan: item.ringkasan,
        konten: item.konten,
        gambar: item.gambar,
      });
    } catch (err) {
      console.warn('Supabase createBerita notice:', err);
    }
  }

  return newItem;
}

export async function updateBeritaItem(item: BeritaItem): Promise<BeritaItem> {
  const db = ensureDbLoaded();
  const idx = db.berita.findIndex((b) => b.id === item.id);
  if (idx !== -1) {
    db.berita[idx] = { ...db.berita[idx], ...item };
  } else {
    db.berita.push(item);
  }
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('berita')
        .update({
          judul: item.judul,
          tanggal: item.tanggal,
          raw_tanggal: item.rawTanggal || item.tanggal,
          kategori: item.kategori,
          ringkasan: item.ringkasan,
          konten: item.konten,
          gambar: item.gambar,
        })
        .eq('id', item.id);
    } catch (err) {
      console.warn('Supabase updateBeritaItem notice:', err);
    }
  }

  return item;
}

export async function deleteBeritaItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.berita = db.berita.filter((b) => b.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('berita').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteBeritaItem notice:', err);
    }
  }
}

// 4. Programs CRUD
export async function getAllPrograms(): Promise<ProgramItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('programs').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted: ProgramItem[] = data.map((r: any) => ({
          id: Number(r.id),
          nama: r.nama,
          deskripsi: r.deskripsi,
          target: r.target,
          progress: Number(r.progress) || 0,
        }));
        const db = ensureDbLoaded();
        db.program = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllPrograms notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.program];
}

export async function createProgram(item: Omit<ProgramItem, 'id'>): Promise<ProgramItem> {
  const newId = Date.now();
  const newItem: ProgramItem = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.program.push(newItem);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('programs').insert({
        id: newId,
        nama: item.nama,
        deskripsi: item.deskripsi,
        target: item.target,
        progress: item.progress,
      });
    } catch (err) {
      console.warn('Supabase createProgram notice:', err);
    }
  }

  return newItem;
}

export async function updateProgramItem(item: ProgramItem): Promise<ProgramItem> {
  const db = ensureDbLoaded();
  const idx = db.program.findIndex((p) => p.id === item.id);
  if (idx !== -1) {
    db.program[idx] = { ...db.program[idx], ...item };
  } else {
    db.program.push(item);
  }
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('programs')
        .update({
          nama: item.nama,
          deskripsi: item.deskripsi,
          target: item.target,
          progress: item.progress,
        })
        .eq('id', item.id);
    } catch (err) {
      console.warn('Supabase updateProgramItem notice:', err);
    }
  }

  return item;
}

export async function deleteProgramItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.program = db.program.filter((p) => p.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('programs').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteProgramItem notice:', err);
    }
  }
}

// 5. Galeri CRUD
export async function getAllGaleri(): Promise<GaleriItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('galeri').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted: GaleriItem[] = data.map((r: any) => ({
          id: Number(r.id),
          judul: r.judul,
          gambar: r.gambar,
        }));
        const db = ensureDbLoaded();
        db.galeri = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllGaleri notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.galeri];
}

export async function createGaleri(item: Omit<GaleriItem, 'id'>): Promise<GaleriItem> {
  const newId = Date.now();
  const newItem: GaleriItem = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.galeri = [newItem, ...db.galeri];
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('galeri').insert({
        id: newId,
        judul: item.judul,
        gambar: item.gambar,
      });
    } catch (err) {
      console.warn('Supabase createGaleri notice:', err);
    }
  }

  return newItem;
}

export async function deleteGaleriItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.galeri = db.galeri.filter((g) => g.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('galeri').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteGaleriItem notice:', err);
    }
  }
}

// 6. Pengurus CRUD
export async function getAllPengurus(): Promise<PengurusItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pengurus').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted: PengurusItem[] = data.map((r: any) => ({
          id: Number(r.id),
          nama: r.nama,
          jabatan: r.jabatan,
          foto: r.foto,
          cabang: r.cabang,
          kontak: r.kontak || undefined,
        }));
        const db = ensureDbLoaded();
        db.pengurus = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllPengurus notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.pengurus];
}

export async function createPengurus(item: Omit<PengurusItem, 'id'>): Promise<PengurusItem> {
  const newId = Date.now();
  const newItem: PengurusItem = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.pengurus.push(newItem);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pengurus').insert({
        id: newId,
        nama: item.nama,
        jabatan: item.jabatan,
        foto: item.foto,
        cabang: item.cabang,
        kontak: item.kontak || '',
      });
    } catch (err) {
      console.warn('Supabase createPengurus notice:', err);
    }
  }

  return newItem;
}

export async function updatePengurusItem(item: PengurusItem): Promise<PengurusItem> {
  const db = ensureDbLoaded();
  const idx = db.pengurus.findIndex((p) => p.id === item.id);
  if (idx !== -1) {
    db.pengurus[idx] = { ...db.pengurus[idx], ...item };
  } else {
    db.pengurus.push(item);
  }
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('pengurus')
        .update({
          nama: item.nama,
          jabatan: item.jabatan,
          foto: item.foto,
          cabang: item.cabang,
          kontak: item.kontak || '',
        })
        .eq('id', item.id);
    } catch (err) {
      console.warn('Supabase updatePengurusItem notice:', err);
    }
  }

  return item;
}

export async function deletePengurusItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.pengurus = db.pengurus.filter((p) => p.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pengurus').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deletePengurusItem notice:', err);
    }
  }
}

// 7. Banks CRUD
export async function getAllBanks(): Promise<BankAccount[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('banks').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted: BankAccount[] = data.map((r: any) => ({
          id: Number(r.id),
          bank: r.bank,
          badge: r.badge,
          norek: r.norek,
          an: r.an,
        }));
        const db = ensureDbLoaded();
        db.banks = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllBanks notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.banks];
}

export async function createBank(item: Omit<BankAccount, 'id'>): Promise<BankAccount> {
  const newId = Date.now();
  const newItem: BankAccount = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.banks.push(newItem);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('banks').insert({
        id: newId,
        bank: item.bank,
        badge: item.badge,
        norek: item.norek,
        an: item.an,
      });
    } catch (err) {
      console.warn('Supabase createBank notice:', err);
    }
  }

  return newItem;
}

export async function updateBankItem(item: BankAccount): Promise<BankAccount> {
  const db = ensureDbLoaded();
  const idx = db.banks.findIndex((b) => b.id === item.id);
  if (idx !== -1) {
    db.banks[idx] = { ...db.banks[idx], ...item };
  } else {
    db.banks.push(item);
  }
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('banks')
        .update({
          bank: item.bank,
          badge: item.badge,
          norek: item.norek,
          an: item.an,
        })
        .eq('id', item.id);
    } catch (err) {
      console.warn('Supabase updateBankItem notice:', err);
    }
  }

  return item;
}

export async function deleteBankItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.banks = db.banks.filter((b) => b.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('banks').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteBankItem notice:', err);
    }
  }
}

// 8. Pesan CRUD
export async function getAllPesan(): Promise<PesanItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pesan').select('*').order('id', { ascending: false });
      if (!error && data) {
        const formatted: PesanItem[] = data.map((r: any) => ({
          id: Number(r.id),
          timestamp: r.timestamp,
          nama: r.nama,
          email: r.email || '',
          telepon: r.telepon,
          subjek: r.subjek,
          pesan: r.pesan,
        }));
        const db = ensureDbLoaded();
        db.pesan = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllPesan notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.pesan];
}

export async function createPesan(item: Omit<PesanItem, 'id'>): Promise<PesanItem> {
  const newId = Date.now();
  const newItem: PesanItem = {
    ...item,
    id: newId,
  };

  const db = ensureDbLoaded();
  db.pesan = [newItem, ...db.pesan];
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pesan').insert({
        id: newId,
        timestamp: item.timestamp,
        nama: item.nama,
        email: item.email || '',
        telepon: item.telepon,
        subjek: item.subjek,
        pesan: item.pesan,
      });
    } catch (err) {
      console.warn('Supabase createPesan notice:', err);
    }
  }

  return newItem;
}

export async function deletePesanItem(id: number): Promise<void> {
  const db = ensureDbLoaded();
  db.pesan = db.pesan.filter((p) => p.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pesan').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deletePesanItem notice:', err);
    }
  }
}

// 9. User Management & Authentication (RBAC)
export async function getAllUsers(): Promise<AppUser[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted: AppUser[] = data.map((r: any) => ({
          id: String(r.id),
          username: r.username,
          password: r.password,
          nama: r.nama,
          role: r.role === 'superadmin' ? 'superadmin' : 'editor',
          email: r.email || '',
          status: r.status || 'active',
          createdAt: r.created_at || new Date().toISOString(),
          lastLogin: r.last_login,
        }));
        const db = ensureDbLoaded();
        db.users = formatted;
        persistDbToFile(db);
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getAllUsers notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return [...db.users];
}

export async function createUser(userData: Omit<AppUser, 'id' | 'createdAt'>): Promise<AppUser> {
  const db = ensureDbLoaded();
  const existing = db.users.find(u => u.username.toLowerCase() === userData.username.trim().toLowerCase());
  if (existing) {
    throw new Error(`Username "${userData.username}" sudah digunakan!`);
  }

  const newId = 'usr_' + Date.now();
  const newUser: AppUser = {
    ...userData,
    id: newId,
    username: userData.username.trim().toLowerCase(),
    password: userData.password.trim(),
    nama: userData.nama.trim(),
    role: userData.role === 'superadmin' ? 'superadmin' : 'editor',
    status: userData.status || 'active',
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.users.push(newUser);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('app_users').insert({
        id: newUser.id,
        username: newUser.username,
        password: newUser.password,
        nama: newUser.nama,
        role: newUser.role,
        email: newUser.email || '',
        status: newUser.status,
        created_at: newUser.createdAt,
      });
    } catch (err) {
      console.warn('Supabase createUser notice:', err);
    }
  }

  return newUser;
}

export async function updateUser(userData: AppUser): Promise<AppUser> {
  const db = ensureDbLoaded();
  const idx = db.users.findIndex(u => u.id === userData.id);
  if (idx === -1) {
    throw new Error('Pengguna tidak ditemukan!');
  }

  // Prevent duplicate username across different users
  const dup = db.users.find(u => u.id !== userData.id && u.username.toLowerCase() === userData.username.trim().toLowerCase());
  if (dup) {
    throw new Error(`Username "${userData.username}" sudah digunakan pengguna lain!`);
  }

  const updated: AppUser = {
    ...db.users[idx],
    username: userData.username.trim().toLowerCase(),
    nama: userData.nama.trim(),
    role: userData.role === 'superadmin' ? 'superadmin' : 'editor',
    email: userData.email,
    status: userData.status || 'active',
    password: userData.password ? userData.password.trim() : db.users[idx].password,
  };

  db.users[idx] = updated;
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('app_users').update({
        username: updated.username,
        nama: updated.nama,
        role: updated.role,
        email: updated.email || '',
        status: updated.status,
        password: updated.password,
      }).eq('id', updated.id);
    } catch (err) {
      console.warn('Supabase updateUser notice:', err);
    }
  }

  return updated;
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = ensureDbLoaded();
  const target = db.users.find(u => u.id === id);
  if (!target) return false;

  // Safeguard: Do not delete if it's the only superadmin
  const superadmins = db.users.filter(u => u.role === 'superadmin');
  if (target.role === 'superadmin' && superadmins.length <= 1) {
    throw new Error('Tidak dapat menghapus satu-satunya Super Admin!');
  }

  db.users = db.users.filter(u => u.id !== id);
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('app_users').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteUser notice:', err);
    }
  }

  return true;
}

export async function verifyUserLogin(username: string, password: string): Promise<AppUser | null> {
  const u = username.trim().toLowerCase();
  const p = password.trim();

  // 1. Try Supabase app_users table
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('app_users').select('*').eq('username', u).single();
      if (!error && data && data.password === p) {
        if (data.status === 'inactive') {
          throw new Error('Akun dinonaktifkan. Hubungi Super Administrator.');
        }
        return {
          id: String(data.id),
          username: data.username,
          password: data.password,
          nama: data.nama,
          role: data.role === 'superadmin' ? 'superadmin' : 'editor',
          email: data.email || '',
          status: data.status || 'active',
          createdAt: data.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      if (err.message && err.message.includes('dinonaktifkan')) throw err;
      console.warn('Supabase verifyUserLogin notice:', err);
    }
  }

  // 2. Check local database users
  const db = ensureDbLoaded();
  const matched = db.users.find(user => user.username.toLowerCase() === u);
  if (matched) {
    if (matched.status === 'inactive') {
      throw new Error('Akun dinonaktifkan. Hubungi Super Administrator.');
    }
    if (matched.password === p) {
      matched.lastLogin = new Date().toISOString();
      persistDbToFile(db);
      return matched;
    }
  }

  // 3. Fallback compatibility for legacy admin credentials
  const currentAdminPass = await getAdminPassword();
  if ((u === 'admin' || u === 'yayasan') && p === currentAdminPass) {
    const adminUser: AppUser = {
      id: 'usr_superadmin_01',
      username: u,
      password: p,
      nama: 'Super Administrator Yayasan',
      role: 'superadmin',
      email: 'admin@binaasrikalbar.org',
      status: 'active',
      createdAt: '2026-01-01',
      lastLogin: new Date().toISOString(),
    };
    return adminUser;
  }

  return null;
}

export async function changeUserPassword(
  username: string,
  oldPass: string,
  newPass: string,
  isSuperAdminOverride = false
): Promise<{ success: boolean; message: string }> {
  const db = ensureDbLoaded();
  const u = username.trim().toLowerCase();
  const target = db.users.find(user => user.username.toLowerCase() === u);

  if (!target) {
    // If not found in users, check legacy admin password
    const legacyPass = await getAdminPassword();
    if ((u === 'admin' || u === 'yayasan') && (isSuperAdminOverride || oldPass === legacyPass)) {
      await setAdminPassword(newPass);
      return { success: true, message: 'Password admin berhasil diubah!' };
    }
    return { success: false, message: 'Pengguna tidak ditemukan!' };
  }

  if (!isSuperAdminOverride && target.password !== oldPass) {
    return { success: false, message: 'Password saat ini tidak sesuai!' };
  }

  target.password = newPass.trim();
  persistDbToFile(db);

  // If this is the main admin, keep adminPassword and admin_settings synced
  if (target.role === 'superadmin') {
    await setAdminPassword(newPass.trim());
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('app_users').update({ password: target.password }).eq('username', target.username);
    } catch (e) {}
  }

  return { success: true, message: `Password untuk user "${target.username}" berhasil diperbarui!` };
}

// 10. Admin Settings / Password (Legacy Compatibility)
export async function getAdminPassword(): Promise<string> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
      if (!error && data && data.value) {
        return data.value;
      }
    } catch (err) {
      console.warn('Supabase getAdminPassword notice:', err);
    }
  }

  const db = ensureDbLoaded();
  return db.adminPassword || 'admin123';
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const db = ensureDbLoaded();
  db.adminPassword = newPassword;
  
  // Also update default superadmin in users array
  const adminUser = db.users.find(u => u.username === 'admin');
  if (adminUser) {
    adminUser.password = newPassword;
  }
  
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('admin_settings').upsert({
        key: 'admin_password',
        value: newPassword,
        updated_at: new Date().toISOString(),
      });
      if (adminUser) {
        await supabase.from('app_users').update({ password: newPassword }).eq('username', 'admin');
      }
    } catch (err) {
      console.warn('Supabase setAdminPassword notice:', err);
    }
  }
}

// 10. Sync Local Foundation Data to Supabase (Push)
export async function syncLocalToSupabase(): Promise<{
  success: boolean;
  message: string;
  insertedCounts?: Record<string, number>;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client belum dikonfigurasi.',
    };
  }

  const db = ensureDbLoaded();
  const counts: Record<string, number> = {};

  try {
    // 1. Site Content
    const contentRows = Object.entries(db.kontenWeb).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      updated_at: new Date().toISOString(),
    }));
    // 1. Site Content
    if (contentRows.length > 0) {
      const { error: errContent } = await supabase.from('site_content').upsert(contentRows);
      if (errContent) {
        throw new Error(`Gagal pada tabel site_content: ${errContent.message} (${errContent.code || 'unknown'})`);
      }
      counts['site_content'] = contentRows.length;
    }

    // 2. Berita
    if (db.berita.length > 0) {
      const rows = db.berita.map((b) => ({
        id: b.id,
        judul: b.judul,
        tanggal: b.tanggal,
        raw_tanggal: b.rawTanggal || b.tanggal,
        kategori: b.kategori,
        ringkasan: b.ringkasan,
        konten: b.konten,
        gambar: b.gambar,
      }));
      const { error: errBerita } = await supabase.from('berita').upsert(rows);
      if (errBerita) {
        throw new Error(`Gagal pada tabel berita: ${errBerita.message} (${errBerita.code || 'unknown'})`);
      }
      counts['berita'] = rows.length;
    }

    // 3. Programs
    if (db.program.length > 0) {
      const rows = db.program.map((p) => ({
        id: p.id,
        nama: p.nama,
        deskripsi: p.deskripsi,
        target: p.target,
        progress: p.progress,
      }));
      const { error: errProg } = await supabase.from('programs').upsert(rows);
      if (errProg) {
        throw new Error(`Gagal pada tabel programs: ${errProg.message} (${errProg.code || 'unknown'})`);
      }
      counts['programs'] = rows.length;
    }

    // 4. Galeri
    if (db.galeri.length > 0) {
      const rows = db.galeri.map((g) => ({
        id: g.id,
        judul: g.judul,
        gambar: g.gambar,
      }));
      const { error: errGal } = await supabase.from('galeri').upsert(rows);
      if (errGal) {
        throw new Error(`Gagal pada tabel galeri: ${errGal.message} (${errGal.code || 'unknown'})`);
      }
      counts['galeri'] = rows.length;
    }

    // 5. Pengurus
    if (db.pengurus.length > 0) {
      const rows = db.pengurus.map((peng) => ({
        id: peng.id,
        nama: peng.nama,
        jabatan: peng.jabatan,
        foto: peng.foto,
        cabang: peng.cabang,
        kontak: peng.kontak || '',
      }));
      const { error: errPeng } = await supabase.from('pengurus').upsert(rows);
      if (errPeng) {
        throw new Error(`Gagal pada tabel pengurus: ${errPeng.message} (${errPeng.code || 'unknown'})`);
      }
      counts['pengurus'] = rows.length;
    }

    // 6. Banks
    if (db.banks.length > 0) {
      const rows = db.banks.map((bk) => ({
        id: bk.id,
        bank: bk.bank,
        badge: bk.badge,
        norek: bk.norek,
        an: bk.an,
      }));
      const { error: errBanks } = await supabase.from('banks').upsert(rows);
      if (errBanks) {
        throw new Error(`Gagal pada tabel banks: ${errBanks.message} (${errBanks.code || 'unknown'})`);
      }
      counts['banks'] = rows.length;
    }

    // 7. Pesan
    if (db.pesan.length > 0) {
      const rows = db.pesan.map((ps) => ({
        id: ps.id,
        timestamp: ps.timestamp,
        nama: ps.nama,
        email: ps.email || '',
        telepon: ps.telepon,
        subjek: ps.subjek,
        pesan: ps.pesan,
      }));
      const { error: errPesan } = await supabase.from('pesan').upsert(rows);
      if (errPesan) {
        throw new Error(`Gagal pada tabel pesan: ${errPesan.message} (${errPesan.code || 'unknown'})`);
      }
      counts['pesan'] = rows.length;
    }

    // 8. Admin Settings
    const { error: errAdm } = await supabase.from('admin_settings').upsert({
      key: 'admin_password',
      value: db.adminPassword,
      updated_at: new Date().toISOString(),
    });
    if (errAdm) {
      throw new Error(`Gagal pada tabel admin_settings: ${errAdm.message} (${errAdm.code || 'unknown'})`);
    }
    counts['admin_settings'] = 1;

    // 9. App Users (RBAC)
    if (db.users && db.users.length > 0) {
      const userRows = db.users.map((u) => ({
        id: u.id,
        username: u.username,
        password: u.password,
        nama: u.nama,
        role: u.role,
        email: u.email || '',
        status: u.status,
        created_at: u.createdAt,
      }));
      try {
        const { error: errUsers } = await supabase.from('app_users').upsert(userRows);
        if (!errUsers) {
          counts['app_users'] = userRows.length;
        }
      } catch (e) {
        console.warn('Note: app_users table might not be created in Supabase yet.');
      }
    }

    return {
      success: true,
      message: 'Seluruh data Yayasan Bina Asri berhasil disinkronkan ke Supabase!',
      insertedCounts: counts,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi ke Supabase gagal: ${err.message}`,
    };
  }
}

// 11. Save Supabase Credentials
export async function saveSupabaseCredentials(url: string, key: string): Promise<void> {
  process.env.SUPABASE_URL = url;
  process.env.SUPABASE_ANON_KEY = key;
  process.env.VITE_SUPABASE_URL = url;
  process.env.VITE_SUPABASE_ANON_KEY = key;

  // Persist to .env if writable
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    // Replace or append SUPABASE_URL
    if (/^SUPABASE_URL=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^SUPABASE_URL=.*$/m, `SUPABASE_URL="${url}"`);
    } else {
      envContent += `\nSUPABASE_URL="${url}"`;
    }

    // Replace or append SUPABASE_ANON_KEY
    if (/^SUPABASE_ANON_KEY=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^SUPABASE_ANON_KEY=.*$/m, `SUPABASE_ANON_KEY="${key}"`);
    } else {
      envContent += `\nSUPABASE_ANON_KEY="${key}"`;
    }

    if (/^VITE_SUPABASE_URL=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^VITE_SUPABASE_URL=.*$/m, `VITE_SUPABASE_URL="${url}"`);
    } else {
      envContent += `\nVITE_SUPABASE_URL="${url}"`;
    }

    if (/^VITE_SUPABASE_ANON_KEY=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^VITE_SUPABASE_ANON_KEY=.*$/m, `VITE_SUPABASE_ANON_KEY="${key}"`);
    } else {
      envContent += `\nVITE_SUPABASE_ANON_KEY="${key}"`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
  } catch (e) {
    console.warn('Notice: .env write skipped in current environment', e);
  }
}

// 12. Reset to defaults
export async function resetAllDataToDefaults(): Promise<void> {
  inMemoryDb = getInitialDatabase();
  persistDbToFile(inMemoryDb);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await syncLocalToSupabase();
    } catch (err) {
      console.warn('Supabase reset sync notice:', err);
    }
  }
}
