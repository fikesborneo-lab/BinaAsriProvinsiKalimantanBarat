# Yayasan Bina Asri - Provinsi Kalimantan Barat

Portal resmi dan sistem manajemen web Yayasan Bina Asri Kalimantan Barat: Lembaga sosial dan pendidikan nirlaba yang berkhidmat untuk kesejahteraan masyarakat, beasiswa pendidikan anak yatim, bantuan sosial kemanusiaan, dan pemberdayaan ekonomi keluarga pra-sejahtera di Kalimantan Barat.

Proyek ini telah dimigrasi dari Google Apps Script ke **React 19, TypeScript, Vite, dan Tailwind CSS** untuk performa tinggi, tampilan modern responsif, serta panel admin interaktif dengan live inline editing.

---

## 🚀 Fitur Utama

- **Portal Publik Informatif**:
  - Profil yayasan, legalitas resmi Kemenkumham RI & NPWP.
  - Visi & Misi lembaga.
  - 4 Indikator capaian dampak (Tahun mengabdi, yatim terbina, paket sembako, transparansi).
  - Program kerja dengan filter kategori (Pendidikan, Sosial, Pemberdayaan) & progress bar interaktif.
  - Kabar berita & artikel terkini dengan modal pembaca lengkap.
  - Galeri dokumentasi kegiatan lapangan dengan modal *lightbox*.
  - Susunan dewan pengurus yayasan.
  - Daftar rekening bank donasi resmi (Bank Kalbar, BRI, Mandiri, BSI) dengan fitur **1-Click Salin Nomor Rekening**.
  - Formulir kontak & permohonan santunan (langsung tersimpan di kotak masuk admin).
  - Tombol melayang (*floating*) WhatsApp dengan pesan pembuka otomatis.

- **Panel Manajemen & Sistem Admin**:
  - Login aman (Kredensial bawaan: Username `admin` | Password `admin123`).
  - **Mode Edit Langsung (*Live Inline Editing*)**: Pengurus dapat mengaktifkan mode edit dan langsung mengubah teks di halaman web secara instan dengan pintasan keyboard `Ctrl+S` / `Cmd+S`.
  - **Dashboard Lengkap**:
    - Ringkasan metrik dan statistik.
    - Formulir edit seluruh narasi, judul, nomor kontak, dan legalitas halaman.
    - CRUD Berita (tambah, edit, hapus).
    - CRUD Program (tambah, edit target, dan persentase progres).
    - CRUD Galeri foto.
    - CRUD Susunan Pengurus.
    - CRUD Rekening Donasi Resmi.
    - Kotak masuk pesan pengunjung dengan tombol langsung balas via WhatsApp.
    - Fitur ganti kata sandi admin.
    - Ekspor & impor cadangan database format JSON.

---

## 🛠️ Panduan Menjalankan Secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Bangun versi produksi
npm run build
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🐙 Cara Publish ke GitHub

1. Buat repository baru di [GitHub](https://github.com/new) (misalnya diberi nama `yayasan-bina-asri-kalbar`).
2. Jalankan perintah berikut di terminal:

```bash
# Inisialisasi git jika belum ada
git init

# Tambahkan seluruh berkas
git add .

# Buat commit pertama
git commit -m "Migrasi Web Yayasan Bina Asri ke React + Vite"

# Buat branch utama
git branch -M main

# Hubungkan ke repository GitHub Anda (ganti URL di bawah dengan URL repo Anda)
git remote add origin https://github.com/USERNAME/yayasan-bina-asri-kalbar.git

# Unggah ke GitHub
git push -u origin main
```

---

## ⚡ Cara Deploy ke Vercel

Proyek ini telah dilengkapi dengan berkas `vercel.json` sehingga dapat langsung dideploy ke Vercel tanpa konfigurasi tambahan:

### Cara 1: Lewat Dashboard Vercel (Direkomendasikan)
1. Buka [Vercel](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository GitHub `yayasan-bina-asri-kalbar` yang telah Anda push sebelumnya.
4. Framework Preset akan otomatis terdeteksi sebagai **Vite**.
5. Klik **"Deploy"**. Dalam hitungan detik website yayasan Anda akan live dengan domain `.vercel.app` dan sertifikat SSL HTTPS otomatis.

### Cara 2: Lewat Vercel CLI
```bash
npm i -g vercel
vercel
```
Ikuti petunjuk di terminal untuk menghubungkan dan menerbitkan website.

---

## 🌐 Menjalankan di Google Antigravity / AI Studio
Proyek ini sepenuhnya kompatibel dan terintegrasi di lingkungan Google AI Studio Build (Antigravity). Anda dapat melakukan pratinjau langsung, pengujian *live build*, dan pengeditan berbasis agen secara real-time.
