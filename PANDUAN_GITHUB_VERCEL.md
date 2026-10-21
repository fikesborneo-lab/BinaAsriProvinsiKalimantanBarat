# Panduan Ekspor Kode ke GitHub & Deploy ke Vercel
## Website Yayasan Bina Asri Provinsi Kalimantan Barat

Dokumen ini memandu Anda langkah demi langkah untuk mengekspor source code website ke **GitHub** pribadi Anda dan mendeploynya ke **Vercel** (atau alternatif hosting full-stack) secara gratis dan permanen.

---

### Ringkasan Arsitektur
- **Frontend**: React 19 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js Express (`server.ts`)
- **Database**: PostgreSQL (Cloud SQL / Supabase / Neon / Vercel Postgres)
- **AI Engine**: Gemini API (`gemini-3.8-flash` - Free Tier)

---

## BAGIAN 1: Menyimpan / Push Kode ke GitHub

### Langkah 1: Inisialisasi Git di Komputer Lokal
Jika Anda telah mengunduh zip source code atau menggunakan terminal:
```bash
# 1. Masuk ke direktori proyek
cd yayasan-bina-asri

# 2. Inisialisasi repositori Git (jika belum)
git init

# 3. Tambahkan semua file ke staging
git add .

# 4. Buat commit pertama
git commit -m "feat: Website Yayasan Bina Asri Kalbar dengan Cloud SQL & AI Berita"
```

### Langkah 2: Buat Repositori Baru di GitHub
1. Buka [github.com/new](https://github.com/new).
2. Beri nama repositori, contoh: `yayasan-bina-asri-kalbar`.
3. Pilih **Private** atau **Public**.
4. Biarkan opsi "Initialize this repository with a README" tidak dicentang (karena sudah ada kode).
5. Klik **Create repository**.

### Langkah 3: Hubungkan dan Push ke GitHub
Jalankan perintah berikut di terminal Anda (ganti `USERNAME` dengan username GitHub Anda):
```bash
git branch -M main
git remote add origin https://github.com/USERNAME/yayasan-bina-asri-kalbar.git
git push -u origin main
```

---

## BAGIAN 2: Deploy ke Vercel

### Langkah 1: Buka Vercel dan Impor Repositori
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repositori `yayasan-bina-asri-kalbar` yang baru saja Anda push, lalu klik **"Import"**.

### Langkah 2: Konfigurasi Proyek di Vercel
Pada halaman konfigurasi Vercel:
- **Framework Preset**: Vite
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Langkah 3: Tambahkan Environment Variables di Vercel
Buka bagian **Environment Variables** di Vercel dan tambahkan variabel berikut:

| Key | Value / Contoh | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]` | Connection string database PostgreSQL (Supabase / Neon / Cloud SQL) |
| `NODE_ENV` | `production` | Mode aplikasi production |
| `GEMINI_API_KEY` | *(Opsional)* API Key dari Google AI Studio | Untuk fitur AI Berita Otomatis gratis |

> **Catatan Database Supabase (Gratis & Direkomendasikan untuk Vercel)**:
> 1. Buat project baru di [supabase.com](https://supabase.com).
> 2. Buka **Project Settings > Database > Connection String (URI)**.
> 3. Salin URL tersebut dan masukkan sebagai nilai `DATABASE_URL` di Vercel.
> Database Anda di Supabase akan tetap aman dan data tidak akan hilang saat website di-update!

### Langkah 4: Klik Deploy
Klik tombol **"Deploy"**. Vercel akan otomatis meng-compile dan website Anda langsung online dengan domain gratis seperti `yayasan-bina-asri.vercel.app` (dan Anda bisa menghubungkan domain `.org` / `.id` yayasan kapan saja).

---

## BAGIAN 3: Alternatif Hosting Full-Stack Lainnya

Jika Anda ingin menjalankan Express server secara utuh tanpa serverless split:
1. **Google Cloud Run** (Sangat direkomendasikan jika sudah terhubung Cloud SQL):
   - Native container deployment, auto-scaling hingga 0 (gratis untuk traffic yayasan).
2. **Railway.app** / **Render.com**:
   - Hubungkan ke GitHub repo, pilih "Web Service", start command `npm run start`, masukkan `DATABASE_URL`.

---

## Dukungan & Bantuan
Yayasan Bina Asri Provinsi Kalimantan Barat
- Admin Portal: Akses menu `/admin` atau klik 2x logo yayasan di halaman utama.
- Sandi Default Admin: `admin123` (dapat diubah di menu Pengaturan Akun).
