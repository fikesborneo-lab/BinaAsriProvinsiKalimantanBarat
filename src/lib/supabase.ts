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
 * Sanitize Supabase URL (strip trailing slashes, spaces, handle accidental postgres url)
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let clean = rawUrl.trim();

  // If user accidentally pasted postgresql connection string
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

  // Ensure https:// prefix
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }

  // Strip trailing slashes
  return clean.replace(/\/+$/, '');
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

  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = key.trim();
  const isConfigured = Boolean(
    cleanUrl &&
    cleanKey &&
    !cleanUrl.includes('your-project') &&
    !cleanKey.includes('your-anon')
  );

  return {
    url: cleanUrl,
    key: cleanKey,
    isConfigured,
    source,
  };
}

/**
 * Save Supabase credentials to localStorage (for client-side persistence)
 */
export function saveClientSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = key.trim();
    localStorage.setItem('bina_asri_supabase_url', cleanUrl);
    localStorage.setItem('bina_asri_supabase_key', cleanKey);
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
 * Create or retrieve cached Supabase client
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
 * Comprehensive diagnostic test for Supabase connection
 */
export async function testSupabaseConnection(overrideUrl?: string, overrideKey?: string): Promise<{
  connected: boolean;
  message: string;
  tableCounts?: Record<string, number>;
  missingTables?: string[];
  error?: string;
  diagnostic?: 'ok' | 'paused' | 'missing_tables' | 'permission_denied' | 'invalid_key' | 'invalid_url' | 'network_error';
}> {
  const config = overrideUrl && overrideKey
    ? { url: sanitizeSupabaseUrl(overrideUrl), key: overrideKey.trim(), isConfigured: true }
    : getSupabaseConfig();

  if (!config.isConfigured || !config.url || !config.key) {
    return {
      connected: false,
      message: 'Supabase belum dikonfigurasi. Harap masukkan SUPABASE_URL dan SUPABASE_ANON_KEY.',
      diagnostic: 'invalid_url',
    };
  }

  // 1. Root ping to test reachability, project status (e.g. paused), and authentication
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const pingRes = await fetch(`${config.url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (pingRes.status === 503) {
      return {
        connected: false,
        message: 'Proyek Supabase Anda dalam status PAUSED (Tertidur). Silakan login ke dashboard Supabase (app.supabase.com), buka proyek Anda, lalu klik "Restore project".',
        error: '503 Service Unavailable (Project Paused)',
        diagnostic: 'paused',
      };
    }

    if (pingRes.status === 401 || pingRes.status === 403) {
      return {
        connected: false,
        message: 'API Key Supabase tidak valid atau ditolak. Pastikan menyalin "anon public key" (diawali eyJ...) di Project Settings > API.',
        error: `${pingRes.status} Unauthorized / Forbidden`,
        diagnostic: 'invalid_key',
      };
    }

    if (pingRes.status === 404) {
      return {
        connected: false,
        message: 'Endpoint Supabase tidak ditemukan (404 Not Found). Pastikan URL berformat: https://<id-proyek>.supabase.co',
        error: '404 Not Found',
        diagnostic: 'invalid_url',
      };
    }
  } catch (pingErr: any) {
    const msg = pingErr?.message || '';
    if (msg.includes('abort') || msg.includes('timeout')) {
      return {
        connected: false,
        message: 'Koneksi ke Supabase time-out. Kemungkinan proyek sedang PAUSED (Tertidur) atau jaringan terputus.',
        error: 'Connection timeout',
        diagnostic: 'paused',
      };
    }
    // Failed to fetch on browser usually means CORS block or network unreachable / paused project
    return {
      connected: false,
      message: 'Gagal terhubung ke Supabase (TypeError: Failed to fetch). Kemungkinan besar proyek Supabase sedang PAUSED (Tertidur) di dashboard Supabase atau URL salah.',
      error: msg || 'Failed to fetch',
      diagnostic: 'network_error',
    };
  }

  let client: SupabaseClient | null = null;
  if (overrideUrl && overrideKey) {
    try {
      client = createClient(sanitizeSupabaseUrl(overrideUrl), overrideKey.trim(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } catch (err: any) {
      return {
        connected: false,
        message: `Format URL atau API Key tidak valid: ${err.message}`,
        error: err.message,
        diagnostic: 'invalid_url',
      };
    }
  } else {
    client = getSupabaseClient();
  }

  if (!client) {
    return {
      connected: false,
      message: 'Gagal menginisialisasi Supabase client.',
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
        tableCounts: counts,
        diagnostic: 'network_error',
      };
    }

    if (missing.length > 0) {
      return {
        connected: false,
        message: `Koneksi aktif, namun ${missing.length} tabel belum dibuat (${missing.slice(0, 3).join(', ')}...). Silakan jalankan skrip SQL di menu SQL Editor Supabase.`,
        tableCounts: counts,
        missingTables: missing,
        diagnostic: 'missing_tables',
      };
    }

    if (permissionDenied.length > 0) {
      return {
        connected: false,
        message: `Akses RLS ditolak pada tabel: ${permissionDenied.join(', ')}. Silakan jalankan skrip SQL untuk memberikan hak akses GRANT & RLS Policy.`,
        tableCounts: counts,
        diagnostic: 'permission_denied',
      };
    }

    return {
      connected: true,
      message: 'Koneksi ke Supabase PostgreSQL berhasil aktif dan seluruh tabel siap digunakan!',
      tableCounts: counts,
      diagnostic: 'ok',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Terjadi kendala saat menghubungi Supabase: ${err.message}`,
      error: err.message,
      diagnostic: 'network_error',
    };
  }
}
