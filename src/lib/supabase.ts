import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let cachedClient: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  return {
    url: url.trim(),
    key: key.trim(),
    isConfigured: Boolean(url && key && !url.includes('your-project-id')),
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tableCounts?: Record<string, number>;
  error?: string;
}> {
  const client = getSupabaseClient();
  const config = getSupabaseConfig();

  if (!config.isConfigured || !client) {
    return {
      connected: false,
      message: 'Supabase belum dikonfigurasi. Harap isi SUPABASE_URL dan SUPABASE_ANON_KEY di environment.',
    };
  }

  try {
    // Test basic query on site_content table
    const { data, error } = await client.from('site_content').select('key').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist
        return {
          connected: false,
          message: 'Terhubung ke Supabase, namun tabel belum dibuat! Jalankan skrip SQL skema di Supabase SQL Editor.',
          error: error.message,
        };
      }
      return {
        connected: false,
        message: `Koneksi Supabase gagal: ${error.message}`,
        error: error.message,
      };
    }

    // Try fetching counts
    const counts: Record<string, number> = {};
    const tables = ['berita', 'programs', 'galeri', 'pengurus', 'banks', 'pesan', 'site_content'];
    
    await Promise.all(
      tables.map(async (table) => {
        try {
          const res = await client.from(table).select('*', { count: 'exact', head: true });
          counts[table] = res.count ?? 0;
        } catch {
          counts[table] = 0;
        }
      })
    );

    return {
      connected: true,
      message: 'Koneksi ke Supabase PostgreSQL berhasil aktif!',
      tableCounts: counts,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Terjadi error saat menghubungi Supabase: ${err.message}`,
      error: err.message,
    };
  }
}
