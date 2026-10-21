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
} from '../data/defaultData.ts';
import {
  KontenWeb,
  BeritaItem,
  ProgramItem,
  GaleriItem,
  PengurusItem,
  BankAccount,
  PesanItem,
} from '../types/index.ts';
import { getSupabaseClient } from '../lib/supabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../../data/foundation_db.json');

export interface DatabaseSchema {
  kontenWeb: KontenWeb;
  berita: BeritaItem[];
  program: ProgramItem[];
  galeri: GaleriItem[];
  pengurus: PengurusItem[];
  banks: BankAccount[];
  pesan: PesanItem[];
  adminPassword: string;
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

// 9. Admin Settings / Password
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
  persistDbToFile(db);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('admin_settings').upsert({
        key: 'admin_password',
        value: newPassword,
        updated_at: new Date().toISOString(),
      });
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
    if (contentRows.length > 0) {
      await supabase.from('site_content').upsert(contentRows);
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
      await supabase.from('berita').upsert(rows);
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
      await supabase.from('programs').upsert(rows);
      counts['programs'] = rows.length;
    }

    // 4. Galeri
    if (db.galeri.length > 0) {
      const rows = db.galeri.map((g) => ({
        id: g.id,
        judul: g.judul,
        gambar: g.gambar,
      }));
      await supabase.from('galeri').upsert(rows);
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
      await supabase.from('pengurus').upsert(rows);
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
      await supabase.from('banks').upsert(rows);
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
      await supabase.from('pesan').upsert(rows);
      counts['pesan'] = rows.length;
    }

    // 8. Admin Settings
    await supabase.from('admin_settings').upsert({
      key: 'admin_password',
      value: db.adminPassword,
      updated_at: new Date().toISOString(),
    });
    counts['admin_settings'] = 1;

    return {
      success: true,
      message: 'Seluruh data Yayasan berhasil disinkronkan ke Supabase!',
      insertedCounts: counts,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Sinkronisasi ke Supabase gagal: ${err.message}`,
    };
  }
}

// 11. Reset to defaults
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
