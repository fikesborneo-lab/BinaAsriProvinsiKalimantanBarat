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

### Langkah 4: Masukkan ke Environment Variables
Tambahkan nilai yang telah Anda salin ke dalam file `.env` (atau di menu Environment Variables Vercel):

```env
SUPABASE_URL="https://abcdefghijklm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Langkah 5: Sinkronkan Data Awal (1-Click Sync)
1. Buka website Yayasan Bina Asri dan masuk ke **Panel Manajemen Admin** (klik dua kali logo yayasan atau buka menu Portal Admin).
2. Pilih tab **"Database Supabase"**.
3. Indikator status akan menampilkan **"Terhubung ke Supabase"**.
4. Klik tombol hijau **"Sinkronkan Data ke Supabase Sekarang"**.
5. Seluruh data bawaan (artikel berita, 8 cabang kabupaten/kota, pengurus, rekening bank, dan galeri) akan langsung diunggah ke database Supabase Anda!

---

### Verifikasi di Supabase Table Editor
Anda dapat membuka menu **Table Editor** di dashboard Supabase untuk melihat data yang sudah masuk secara langsung dan mengelolanya kapan saja.
