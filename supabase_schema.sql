-- ====================================================================
-- SKEMA DATABASE SUPABASE UNTUK YAYASAN BINA ASRI KALIMANTAN BARAT
-- ====================================================================
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql/new

-- 1. TABEL: site_content (Pengaturan teks, narasi, kontak, dan logo)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL: berita (Kabar berita, artikel, dan dokumentasi)
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

-- 3. TABEL: programs (Program kerja dan progres persentase)
CREATE TABLE IF NOT EXISTS public.programs (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  target TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL: galeri (Foto dokumentasi aksi lapangan)
CREATE TABLE IF NOT EXISTS public.galeri (
  id BIGINT PRIMARY KEY,
  judul TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL: pengurus (Susunan pengurus pusat & 8 cabang daerah se-Kalbar)
CREATE TABLE IF NOT EXISTS public.pengurus (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  foto TEXT NOT NULL,
  cabang TEXT NOT NULL DEFAULT 'Pusat / Wilayah Kalbar',
  kontak TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL: banks (Rekening bank donasi resmi)
CREATE TABLE IF NOT EXISTS public.banks (
  id BIGINT PRIMARY KEY,
  bank TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Daerah',
  norek TEXT NOT NULL,
  an TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL: pesan (Kotak masuk pesan pengunjung web)
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

-- 8. TABEL: admin_settings (Kredensial dan sandi admin yayasan)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & KEBIJAKAN AKSES
-- ====================================================================

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Izinkan publik membaca konten (Anon / Public READ)
DROP POLICY IF EXISTS "Public can view site content" ON public.site_content;
CREATE POLICY "Public can view site content" ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view news" ON public.berita;
CREATE POLICY "Public can view news" ON public.berita FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view programs" ON public.programs;
CREATE POLICY "Public can view programs" ON public.programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view gallery" ON public.galeri;
CREATE POLICY "Public can view gallery" ON public.galeri FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view board members" ON public.pengurus;
CREATE POLICY "Public can view board members" ON public.pengurus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view banks" ON public.banks;
CREATE POLICY "Public can view banks" ON public.banks FOR SELECT USING (true);

-- Izinkan publik mengirimkan pesan kontak (Anon INSERT)
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.pesan;
CREATE POLICY "Public can submit contact messages" ON public.pesan FOR INSERT WITH CHECK (true);

-- Izinkan Service Role / Backend melakukan manajemen penuh (CRUD)
DROP POLICY IF EXISTS "Service role full access site_content" ON public.site_content;
CREATE POLICY "Service role full access site_content" ON public.site_content USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access berita" ON public.berita;
CREATE POLICY "Service role full access berita" ON public.berita USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access programs" ON public.programs;
CREATE POLICY "Service role full access programs" ON public.programs USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access galeri" ON public.galeri;
CREATE POLICY "Service role full access galeri" ON public.galeri USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access pengurus" ON public.pengurus;
CREATE POLICY "Service role full access pengurus" ON public.pengurus USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access banks" ON public.banks;
CREATE POLICY "Service role full access banks" ON public.banks USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access pesan" ON public.pesan;
CREATE POLICY "Service role full access pesan" ON public.pesan USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access admin_settings" ON public.admin_settings;
CREATE POLICY "Service role full access admin_settings" ON public.admin_settings USING (true) WITH CHECK (true);

-- Inisialisasi sandi default admin jika belum ada
INSERT INTO public.admin_settings (key, value)
VALUES ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;
