# Panduan Integrasi Supabase Database
## Yayasan Bina Asri Provinsi Kalimantan Barat

Dokumen ini memandu Anda menghubungkan website Yayasan Bina Asri dengan database **Supabase PostgreSQL** cloud secara gratis dan permanen.

---

### Mengapa Supabase?
- **Cloud PostgreSQL Berkinerja Tinggi**: Menyimpan data artikel, donasi, program, dan pesan secara persisten.
- **Gratis (Free Tier)**: Termasuk kuota gratis hingga 500 MB database dan 50.000 pengguna aktif bulanan.
- **Realtime & Aman**: Dilengkapi *Row Level Security (RLS)* dan API bawaan.
- **Dukungan Dual-Mode**: Jika kredensial Supabase belum diisi, website otomatis beralih ke penyimpanan lokal JSON agar aplikasi tidak pernah mengalami error atau halaman kosong.

---

### Langkah 1: Buat Proyek di Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan masuk dengan akun GitHub Anda.
2. Klik tombol **"New Project"**.
3. Isi informasi proyek:
   - **Name**: `yayasan-bina-asri`
   - **Database Password**: Buat kata sandi yang kuat (simpan sandi ini dengan aman).
   - **Region**: Pilih yang terdekat, misalnya **Singapore (ap-southeast-1)**.
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga database siap.

---

### Langkah 2: Buat Tabel Database (1-Click SQL)
1. Di dashboard Supabase proyek Anda, buka menu **SQL Editor** di panel sebelah kiri.
2. Klik tombol **"New query"**.
3. Buka berkas `supabase_schema.sql` yang ada di proyek ini, lalu salin seluruh kodenya.
4. Tempel (*paste*) ke dalam editor SQL Supabase, lalu klik tombol **"Run"** (atau tekan `Ctrl+Enter`).
5. Selesai! Seluruh 8 tabel berikut akan otomatis dibuat beserta kebijakan keamanannya:
   - `site_content` (Pengaturan narasi web, logo, kontak)
   - `berita` (Artikel berita dan kegiatan lapangan)
   - `programs` (Program kerja yayasan dan capaian progres)
   - `galeri` (Foto dokumentasi kegiatan)
   - `pengurus` (Struktur kepengurusan di 8 cabang daerah dan pusat)
   - `banks` (Nomor rekening donasi resmi)
   - `pesan` (Pesan masuk dari pengunjung web)
   - `admin_settings` (Kredensial administrator)

---

### Langkah 3: Ambil URL dan API Key
1. Di dashboard Supabase, buka menu **Project Settings** (ikon roda gigi di pojok kiri bawah) > **API**.
2. Salin nilai berikut:
   - **Project URL**: Contoh `https://abcdefghijklm.supabase.co`
   - **anon / public key**: Kunci akses publik untuk frontend
   - **service_role key**: Kunci akses penuh untuk backend server (jangan dibagikan ke publik)

---

### Langkah 4: Hubungkan ke Website (2 Cara Mudah)
Anda dapat memilih salah satu cara berikut:

#### Opsi A: Langsung dari Panel Admin Website (Paling Mudah & Instan!)
1. Buka website Yayasan Bina Asri yang telah aktif (baik di localhost maupun di Vercel).
2. Masuk ke **Panel Admin** (klik 2x logo yayasan atau buka tab Admin).
3. Buka tab **"Database Supabase"**.
4. Di bagian **"🔑 Pengaturan Kredensial Supabase"**, tempel:
   - **Project URL Supabase**: Contoh `https://abcdefghijklm.supabase.co`
   - **API Key**: Tempel **anon key** atau **service_role key**
5. Klik **"Simpan Kredensial & Hubungkan"**.
6. Klik **"Uji Koneksi Sekarang"** untuk memastikan status berubah menjadi hijau (Terhubung).
7. Selesai! Kredensial ini disimpan aman di browser dan file server Anda, sehingga website langsung terhubung tanpa perlu mengedit berkas kode.

#### Opsi B: Melalui File `.env` atau Vercel Environment Variables
Tambahkan nilai yang telah Anda salin ke dalam file `.env` (di komputer lokal) atau di menu **Project Settings > Environment Variables** di Vercel:

```env
# URL Proyek Supabase
VITE_SUPABASE_URL="https://abcdefghijklm.supabase.co"
SUPABASE_URL="https://abcdefghijklm.supabase.co"

# API Key Supabase (anon / public)
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Langkah 5: Unggah Data Awal ke Supabase (1-Click Sync)
1. Di tab **Database Supabase** pada Panel Admin, klik tombol hijau **"Unggah Semua Data ke Supabase"** (atau "Sinkronkan Data Sekarang").
2. Sistem akan otomatis memasukkan seluruh data awal yayasan:
   - Pengaturan website & profil narasi Yayasan Bina Asri
   - Seluruh artikel berita penanggulangan TBC dan kegiatan sosial
   - Program kerja eliminasi TBC di Kalimantan Barat
   - Galeri foto kegiatan aksi lapangan
   - Struktur pengurus 8 cabang daerah se-Kalbar
   - Rekening bank donasi resmi
3. Buka menu **Table Editor** di dashboard Supabase Anda, seluruh tabel kini telah terisi dengan rapi!

---

### Mengapa Koneksi Supabase Sekarang Stabil di Vercel?
- Skrip `supabase_schema.sql` terbaru telah menyertakan perintah `GRANT ALL ON TABLE ... TO anon, authenticated, service_role;` serta kebijakan `ROW LEVEL SECURITY (RLS)` terbuka (`FOR ALL`).
- Hal ini mencegah error *42501 (permission denied for table)* yang sering terjadi ketika Vercel client menggunakan `anon key`.
- Sistem juga mendeteksi URL yang dimasukkan secara otomatis dan membersihkan akhiran slash (`/`) atau format URI yang keliru.

