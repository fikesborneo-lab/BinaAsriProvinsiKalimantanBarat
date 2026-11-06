import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let lastConfigHash: string = '';

export interface SupabaseConfig {
  url: string;
  key: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

/**
 * Sanitize and normalize Supabase project URL.
 * Handles dashboard links, trailing slashes, /rest/v1 paths, quotes, and postgres connection strings.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();

  // Strip wrapping quotes or brackets
  clean = clean.replace(/^["'`<]+|["'`>]+$/g, '').trim();

  // 1. If user accidentally pasted postgresql connection string
  if (clean.startsWith('postgresql://') || clean.startsWith('postgres://')) {
    const match = clean.match(/@([^:]+):/);
    if (match && match[1]) {
      const host = match[1];
      if (host.includes('.pooler.supabase.com')) {
        const ref = host.split('.')[0].replace(/^db\./, '');
        return `https://${ref}.supabase.co`;
      }
    }
  }

  // 2. If user pasted Supabase dashboard link (e.g., https://supabase.com/dashboard/project/abcdefgh...)
  const dashboardMatch = clean.match(/supabase\.com\/(?:dashboard\/)?project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // 3. If user pasted URL containing <project-ref>.supabase.co with subpaths like /rest/v1 or /settings
  const subDomainMatch = clean.match(/([a-z0-9_-]+)\.supabase\.co/i);
  if (subDomainMatch && subDomainMatch[1]) {
    const ref = subDomainMatch[1];
    if (ref !== 'app' && ref !== 'api' && ref !== 'db' && ref !== 'supabase') {
      return `https://${ref}.supabase.co`;
    }
  }

  // 4. If user entered just the project reference code (e.g. 20 chars like 'vi3lkqmnkml7jde6gpeb')
  if (/^[a-z0-9_-]{12,35}$/i.test(clean) && !clean.includes('.') && !clean.includes('/')) {
    return `https://${clean}.supabase.co`;
  }

  // 5. General fallback: ensure https:// prefix and strip any subpaths (/rest/v1, /settings, etc.)
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // Strip any trailing path components like /rest/v1, /rest/v1/, etc.
  try {
    const parsed = new URL(clean);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return clean.replace(/\/+$/, '');
  }
}

/**
 * Sanitize and detect if user accidentally swapped URL and API Key
 */
export function sanitizeSupabaseCredentials(rawUrl: string, rawKey: string): { url: string; key: string } {
  let u = (rawUrl || '').trim();
  let k = (rawKey || '').trim();

  // Strip wrapping quotes
  u = u.replace(/^["'`<]+|["'`>]+$/g, '').trim();
  k = k.replace(/^["'`<]+|["'`>]+$/g, '').trim();

  // Auto-heal swapped inputs: URL starts with eyJ (JWT API Key) and Key contains domain or http
  if (u.startsWith('eyJ') && (k.includes('supabase.co') || k.startsWith('http') || k.length < 50)) {
    const temp = u;
    u = k;
    k = temp;
  }

  return {
    url: sanitizeSupabaseUrl(u),
    key: k,
  };
}

/**
 * Retrieves Supabase configuration from all possible sources:
 * 1. Process environment (server or build-time)
 * 2. Vite import.meta.env (client-side)
 * 3. Browser localStorage (if saved via Admin UI)
 */
export function getSupabaseConfig(): SupabaseConfig {
  let url = '';
  let key = '';
  let source: 'env' | 'storage' | 'none' = 'none';

  // 1. Check process.env (Node / Express)
  if (typeof process !== 'undefined' && process.env) {
    url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (url && key) source = 'env';
  }

  // 2. Check import.meta.env (Vite client-side)
  if ((!url || !key) && typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const viteUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL;
    const viteKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY;
    if (viteUrl && viteKey) {
      url = viteUrl;
      key = viteKey;
      source = 'env';
    }
  }

  // 3. Check browser localStorage (if user configured via Admin Panel)
  if ((!url || !key) && typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedUrl = localStorage.getItem('bina_asri_supabase_url');
      const storedKey = localStorage.getItem('bina_asri_supabase_key');
      if (storedUrl && storedKey) {
        url = storedUrl;
        key = storedKey;
        source = 'storage';
      }
    } catch {
      // Ignore storage errors
    }
  }

  const sanitized = sanitizeSupabaseCredentials(url, key);
  // Auto-heal localStorage if stored value had /rest/v1 or other artifacts
  if (source === 'storage' && sanitized.url && sanitized.url !== url && typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('bina_asri_supabase_url', sanitized.url);
      localStorage.setItem('bina_asri_supabase_key', sanitized.key);
    } catch {}
  }

  const isConfigured = Boolean(
    sanitized.url &&
    sanitized.key &&
    !sanitized.url.includes('your-project') &&
    !sanitized.key.includes('your-anon')
  );

  return {
    url: sanitized.url,
    key: sanitized.key,
    isConfigured,
    source,
  };
}

/**
 * Save Supabase credentials to localStorage (for client-side persistence)
 */
export function saveClientSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const sanitized = sanitizeSupabaseCredentials(url, key);
    localStorage.setItem('bina_asri_supabase_url', sanitized.url);
    localStorage.setItem('bina_asri_supabase_key', sanitized.key);
    // Invalidate client cache
    cachedClient = null;
    lastConfigHash = '';
  }
}

/**
 * Remove stored Supabase credentials
 */
export function clearClientSupabaseConfig(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('bina_asri_supabase_url');
    localStorage.removeItem('bina_asri_supabase_key');
    cachedClient = null;
    lastConfigHash = '';
  }
}

/**
 * Create or retrieve cached Supabase client with safe multi-query options
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  const currentHash = `${config.url}_${config.key}`;
  if (!cachedClient || lastConfigHash !== currentHash) {
    try {
      cachedClient = createClient(config.url, config.key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'x-client-info': 'bina-asri-kalbar/2.0',
          },
        },
      });
      lastConfigHash = currentHash;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

/**
 * Safe Batch Upsert utility for single table: chunks data to prevent payload overflow
 */
export async function batchUpsertTable(
  supabase: SupabaseClient,
  table: string,
  rows: any[],
  chunkSize = 50
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!rows || rows.length === 0) {
    return { success: true, count: 0 };
  }
  let totalInserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    try {
      const { error } = await supabase.from(table).upsert(chunk);
      if (error) {
        const isFetchErr = error.message?.includes('fetch') || error.message?.includes('network');
        const msg = isFetchErr
          ? `Koneksi ke Supabase terputus. Pastikan proyek aktif di dashboard Supabase.`
          : error.message;
        return {
          success: false,
          count: totalInserted,
          error: `Tabel ${table}: ${msg} (${error.code || 'ERR'})`,
        };
      }
      totalInserted += chunk.length;
    } catch (err: any) {
      const msg = err?.message || 'Gagal eksekusi query';
      const isFetchErr = msg.includes('fetch') || msg.includes('network');
      return {
        success: false,
        count: totalInserted,
        error: `Tabel ${table}: ${isFetchErr ? 'Koneksi ke Supabase terputus. Pastikan status proyek aktif (tidak di-pause) di dashboard Supabase.' : msg}`,
      };
    }
  }
  return { success: true, count: totalInserted };
}

export interface FoundationSyncPayload {
  kontenWeb?: Record<string, any>;
  berita?: any[];
  program?: any[];
  galeri?: any[];
  pengurus?: any[];
  banks?: any[];
  pesan?: any[];
  users?: any[];
}

/**
 * Upload all Foundation data using Promise.allSettled and chunked batches
 */
export async function batchUploadToSupabase(
  supabase: SupabaseClient,
  data: FoundationSyncPayload
): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
  errors: string[];
}> {
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  const tasks: { table: string; rows: any[] }[] = [];

  // 1. Site Content
  if (data.kontenWeb && Object.keys(data.kontenWeb).length > 0) {
    const contentRows = Object.entries(data.kontenWeb).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      updated_at: new Date().toISOString(),
    }));
    tasks.push({ table: 'site_content', rows: contentRows });
  }

  // 2. Berita
  if (Array.isArray(data.berita) && data.berita.length > 0) {
    const rows = data.berita.map((b) => ({
      id: Number(b.id),
      judul: b.judul,
      tanggal: b.tanggal,
      raw_tanggal: b.rawTanggal || b.tanggal,
      kategori: b.kategori,
      ringkasan: b.ringkasan,
      konten: b.konten,
      gambar: b.gambar,
    }));
    tasks.push({ table: 'berita', rows });
  }

  // 3. Program
  if (Array.isArray(data.program) && data.program.length > 0) {
    const rows = data.program.map((p) => ({
      id: Number(p.id),
      nama: p.nama,
      deskripsi: p.deskripsi,
      target: p.target,
      progress: Number(p.progress) || 0,
    }));
    tasks.push({ table: 'programs', rows });
  }

  // 4. Galeri
  if (Array.isArray(data.galeri) && data.galeri.length > 0) {
    const rows = data.galeri.map((g) => ({
      id: Number(g.id),
      judul: g.judul,
      gambar: g.gambar,
    }));
    tasks.push({ table: 'galeri', rows });
  }

  // 5. Pengurus
  if (Array.isArray(data.pengurus) && data.pengurus.length > 0) {
    const rows = data.pengurus.map((pg) => ({
      id: Number(pg.id),
      nama: pg.nama,
      jabatan: pg.jabatan,
      foto: pg.foto,
      cabang: pg.cabang,
      kontak: pg.kontak || '',
    }));
    tasks.push({ table: 'pengurus', rows });
  }

  // 6. Banks
  if (Array.isArray(data.banks) && data.banks.length > 0) {
    const rows = data.banks.map((bk) => ({
      id: Number(bk.id),
      bank: bk.bank,
      badge: bk.badge,
      norek: bk.norek,
      an: bk.an,
    }));
    tasks.push({ table: 'banks', rows });
  }

  // 7. Pesan
  if (Array.isArray(data.pesan) && data.pesan.length > 0) {
    const rows = data.pesan.map((ps) => ({
      id: Number(ps.id),
      timestamp: ps.timestamp,
      nama: ps.nama,
      email: ps.email || '',
      telepon: ps.telepon,
      subjek: ps.subjek,
      pesan: ps.pesan,
    }));
    tasks.push({ table: 'pesan', rows });
  }

  // 8. Admin Settings
  tasks.push({
    table: 'admin_settings',
    rows: [{ key: 'admin_password', value: 'admin123', updated_at: new Date().toISOString() }],
  });

  // 9. App Users (RBAC)
  if (Array.isArray(data.users) && data.users.length > 0) {
    const userRows = data.users.map((u) => ({
      id: String(u.id),
      username: u.username,
      password: u.password,
      nama: u.nama,
      role: u.role,
      email: u.email || '',
      status: u.status,
      created_at: u.createdAt,
    }));
    tasks.push({ table: 'app_users', rows: userRows });
  }

  // Execute concurrently with Promise.allSettled
  const settledResults = await Promise.allSettled(
    tasks.map(async (t) => {
      const res = await batchUpsertTable(supabase, t.table, t.rows);
      return { table: t.table, ...res };
    })
  );

  for (const item of settledResults) {
    if (item.status === 'fulfilled') {
      const val = item.value;
      if (val.success) {
        counts[val.table] = val.count;
      } else if (val.error) {
        errors.push(val.error);
      }
    } else {
      errors.push(item.reason?.message || 'Gagal eksekusi query batch');
    }
  }

  const success = errors.length === 0 || Object.keys(counts).length > 0;
  let message = 'Seluruh data Yayasan Bina Asri berhasil disinkronkan ke Supabase!';
  if (errors.length > 0 && Object.keys(counts).length > 0) {
    message = `Sinkronisasi selesai sebagian (${Object.keys(counts).length} tabel berhasil). Periksa skrip SQL untuk tabel yang tertunda: ${errors.join(', ')}`;
  } else if (errors.length > 0) {
    message = `Gagal sinkronisasi: ${errors[0]}`;
  }

  return {
    success,
    message,
    counts,
    errors,
  };
}

/**
 * Comprehensive diagnostic test for Supabase connection
 */
export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{
  connected: boolean;
  message: string;
  tableCounts?: Record<string, number>;
  missingTables?: string[];
  error?: string;
  url?: string;
  diagnostic?: 'ok' | 'paused' | 'missing_tables' | 'permission_denied' | 'invalid_key' | 'invalid_url' | 'network_error';
}> {
  const currentCfg = getSupabaseConfig();
  const rawUrl = overrideUrl || currentCfg.url;
  const rawKey = overrideKey || currentCfg.key;
  const sanitized = sanitizeSupabaseCredentials(rawUrl, rawKey);

  const cleanUrl = sanitized.url;
  const cleanKey = sanitized.key;

  if (!cleanUrl || !cleanKey || cleanUrl.includes('your-project') || cleanKey.includes('your-anon')) {
    return {
      connected: false,
      message: 'Supabase belum dikonfigurasi. Harap masukkan SUPABASE_URL dan SUPABASE_ANON_KEY.',
      url: cleanUrl,
      diagnostic: 'invalid_url',
    };
  }

  // 1. Initial quick ping to test reachability, project status (paused), and authentication
  let rootPing404 = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const pingRes = await fetch(`${cleanUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: cleanKey,
        Authorization: `Bearer ${cleanKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (pingRes.status === 503) {
      return {
        connected: false,
        message: 'Proyek Supabase Anda dalam status PAUSED (Tertidur). Silakan login ke dashboard Supabase (app.supabase.com), buka proyek Anda, lalu klik "Restore project".',
        error: '503 Service Unavailable (Project Paused)',
        url: cleanUrl,
        diagnostic: 'paused',
      };
    }

    if (pingRes.status === 401 || pingRes.status === 403) {
      return {
        connected: false,
        message: 'API Key Supabase tidak valid atau ditolak. Pastikan menyalin "anon public key" (diawali eyJ...) di Project Settings > API.',
        error: `${pingRes.status} Unauthorized / Forbidden`,
        url: cleanUrl,
        diagnostic: 'invalid_key',
      };
    }

    if (pingRes.status === 404) {
      // Note: In Supabase, GET /rest/v1/ can return 404 if "Expose OpenAPI specification" is disabled in dashboard.
      // We will verify via direct PostgREST table query below before failing.
      rootPing404 = true;
    }
  } catch (pingErr: any) {
    const msg = pingErr?.message || '';
    if (msg.includes('abort') || msg.includes('timeout')) {
      return {
        connected: false,
        message: 'Koneksi ke Supabase time-out. Kemungkinan proyek sedang PAUSED (Tertidur) atau jaringan terputus.',
        error: 'Connection timeout',
        url: cleanUrl,
        diagnostic: 'paused',
      };
    }
    // Network / CORS block - will also be rechecked by client query below
  }

  // 2. Direct Supabase PostgREST table verification
  let client: SupabaseClient | null = null;
  try {
    client = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err: any) {
    return {
      connected: false,
      message: `Format URL atau API Key tidak valid: ${err.message}`,
      error: err.message,
      url: cleanUrl,
      diagnostic: 'invalid_url',
    };
  }

  if (!client) {
    return {
      connected: false,
      message: 'Gagal menginisialisasi Supabase client.',
      url: cleanUrl,
      diagnostic: 'invalid_url',
    };
  }

  try {
    const requiredTables = [
      'site_content',
      'berita',
      'programs',
      'galeri',
      'pengurus',
      'banks',
      'pesan',
      'admin_settings',
      'app_users',
    ];
    const counts: Record<string, number> = {};
    const missing: string[] = [];
    const permissionDenied: string[] = [];
    let hasNetworkError = false;

    // Test each table
    for (const table of requiredTables) {
      try {
        const res = await client.from(table).select('*', { count: 'exact', head: true });
        if (res.error) {
          if (res.error.code === '42P01') {
            missing.push(table);
          } else if (res.error.code === '42501') {
            permissionDenied.push(table);
            counts[table] = -1;
          } else if (res.error.message && (res.error.message.includes('fetch') || res.error.message.includes('network'))) {
            hasNetworkError = true;
            counts[table] = -1;
          } else if (res.status === 404 || res.error.message?.includes('404')) {
            missing.push(table);
          } else {
            counts[table] = -1;
          }
        } else {
          counts[table] = res.count ?? 0;
        }
      } catch (tableErr: any) {
        if (tableErr?.message && (tableErr.message.includes('fetch') || tableErr.message.includes('network'))) {
          hasNetworkError = true;
        }
        missing.push(table);
      }
    }

    if (hasNetworkError) {
      return {
        connected: false,
        message: 'Koneksi ke database Supabase terputus (TypeError: Failed to fetch). Pastikan proyek Anda aktif (tidak di-pause) di dashboard Supabase.',
        error: 'Failed to fetch',
        url: cleanUrl,
        tableCounts: counts,
        diagnostic: 'network_error',
      };
    }

    if (rootPing404 && missing.length === requiredTables.length) {
      return {
        connected: false,
        message: 'Endpoint Supabase tidak ditemukan (404 Not Found). Pastikan URL menggunakan format standar: https://<id-proyek>.supabase.co (tanpa /rest/v1 di belakang)',
        error: '404 Not Found',
        url: cleanUrl,
        diagnostic: 'invalid_url',
      };
    }

    if (missing.length > 0) {
      return {
        connected: false,
        message: `Koneksi aktif! Namun ${missing.length} tabel belum dibuat di Supabase (${missing.slice(0, 3).join(', ')}...). Silakan jalankan skrip SQL di menu SQL Editor Supabase.`,
        url: cleanUrl,
        tableCounts: counts,
        missingTables: missing,
        diagnostic: 'missing_tables',
      };
    }

    if (permissionDenied.length > 0) {
      return {
        connected: false,
        message: `Akses RLS ditolak pada tabel: ${permissionDenied.join(', ')}. Silakan jalankan skrip SQL untuk memberikan hak akses GRANT & RLS Policy.`,
        url: cleanUrl,
        tableCounts: counts,
        diagnostic: 'permission_denied',
      };
    }

    return {
      connected: true,
      message: 'Koneksi ke Supabase PostgreSQL berhasil aktif dan seluruh tabel siap digunakan!',
      url: cleanUrl,
      tableCounts: counts,
      diagnostic: 'ok',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Terjadi kendala saat menghubungi Supabase: ${err.message}`,
      url: cleanUrl,
      error: err.message,
      diagnostic: 'network_error',
    };
  }
}
