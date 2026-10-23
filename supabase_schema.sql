-- ====================================================================
-- SKEMA DATABASE SUPABASE RESMI: YAYASAN BINA ASRI KALIMANTAN BARAT
-- ====================================================================
-- Petunjuk:
-- 1. Buka https://supabase.com/dashboard/project/_/sql/new
-- 2. Tempel seluruh skrip ini di SQL Editor
-- 3. Klik tombol "RUN" (atau tekan Ctrl + Enter)
-- ====================================================================

-- 1. TABEL: site_content (Pengaturan narasi web, judul, kontak, dan logo)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL: berita (Artikel, berita kegiatan, dan liputan lapangan)
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

-- 3. TABEL: programs (Program kerja penanggulangan TBC & capaian)
CREATE TABLE IF NOT EXISTS public.programs (
  id BIGINT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  target TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL: galeri (Foto dokumentasi aksi nyata di lapangan)
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
  cabang TEXT NOT NULL DEFAULT 'Pusat / SR Kalbar',
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

-- 8. TABEL: admin_settings (Kredensial dan sandi administrator)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- HAK AKSES PERMISSION (GRANTS)
-- ====================================================================
GRANT ALL ON TABLE public.site_content TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.berita TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.galeri TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pengurus TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.banks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.pesan TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_settings TO anon, authenticated, service_role;

-- ====================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) DENGAN KEBIJAKAN PENUH
-- ====================================================================
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Public access site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public access berita" ON public.berita;
DROP POLICY IF EXISTS "Public access programs" ON public.programs;
DROP POLICY IF EXISTS "Public access galeri" ON public.galeri;
DROP POLICY IF EXISTS "Public access pengurus" ON public.pengurus;
DROP POLICY IF EXISTS "Public access banks" ON public.banks;
DROP POLICY IF EXISTS "Public access pesan" ON public.pesan;
DROP POLICY IF EXISTS "Public access admin_settings" ON public.admin_settings;

-- Create open RLS policies (allow reading and writing so web & admin operate seamlessly)
CREATE POLICY "Public access site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access berita" ON public.berita FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pengurus" ON public.pengurus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access banks" ON public.banks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access pesan" ON public.pesan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);

-- Default admin password
INSERT INTO public.admin_settings (key, value)
VALUES ('admin_password', 'admin123')
ON CONFLICT (key) DO NOTHING;
