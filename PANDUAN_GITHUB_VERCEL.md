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
Buka bagian **Project Settings > Environment Variables** di Vercel dan tambahkan variabel berikut:

| Key | Value / Contoh | Keterangan |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://abcdefghijklm.supabase.co` | Supabase Project URL (wajib agar frontend Vercel langsung terhubung) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anon/Public Key untuk akses client-side |
| `SUPABASE_URL` | `https://abcdefghijklm.supabase.co` | Untuk fungsi backend API Vercel Serverless (`/api/*`) |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Untuk fungsi backend API Vercel Serverless |
| `GEMINI_API_KEY` | *(Opsional)* API Key Google AI Studio | Untuk fitur pembuatan berita & narasi otomatis dengan AI |

> 💡 **TIPS PRAKTIS (Tanpa Konfigurasi Manual di Vercel)**:
> Anda juga dapat langsung memasukkan **Project URL** dan **Anon Key** Supabase melalui **Panel Admin** website (`/admin` > Tab **Database Supabase**). Kredensial akan langsung disimpan di browser Anda dan data otomatis tersinkronisasi ke cloud database Supabase!

### Mengapa Update di GitHub & Vercel Sekarang Aman & Permanen?
1. **Penyimpanan Terpusat di Cloud (Supabase PostgreSQL)**:
   Saat Anda melakukan `git push` ke GitHub dan Vercel melakukan build ulang (*redeploy*), seluruh data artikel, pengurus cabang, galeri, rekening donasi, dan pengaturan website **TIDAK AKAN HILANG** karena disimpan di server Supabase, bukan di file lokal sementara.
2. **Dukungan Vercel Serverless Function (`/api`)**:
   Berkas `api/index.ts` dan konfigurasi `vercel.json` telah disiapkan agar endpoint API `/api/*` berjalan mulus sebagai Vercel Serverless Function.
3. **Dual-Mode Client Fallback**:
   Jika Vercel dideploy dalam mode static hosting, antarmuka web secara otomatis berkomunikasi langsung dengan Supabase client-side melalui `@supabase/supabase-js`, sehingga tidak ada lagi galat HTML 200 saat mengambil JSON.

### Langkah 4: Klik Deploy & Cara Mengatasi Galat (Redeploy)
1. Klik tombol **"Deploy"**.
2. **PENTING**: Jika sebelumnya proses Deploy di Vercel Anda gagal (*Deployment failed with error*), penyebab utamanya adalah:
   - **Konflik Dependency npm**: Sebelumnya terdapat duplikasi `esbuild` vs `vite` di `package.json` yang memicu galat `ERESOLVE could not resolve` saat Vercel menjalankan `npm install`. Masalah ini telah **DISELESAIKAN** dan file `package-lock.json` resmi telah dibuat.
   - **Routing Vercel Serverless Function**: Konfigurasi `vercel.json` dan `api/index.ts` telah diselaraskan agar Vercel dapat menjalankan Express API `/api/*` sekaligus Vite frontend `/dist` secara otomatis.

3. **Cara Menerapkan Perbaikan ke Vercel (Hanya 3 Perintah)**:
   Jalankan ini di folder proyek komputer Anda untuk mengirim perbaikan ke GitHub:
   ```bash
   git add .
   git commit -m "fix: selesaikan dependensi npm dan konfigurasi deploy vercel"
   git push origin main
   ```
   *Begitu perintah ini dijalankan, Vercel akan **otomatis mendeteksi push baru** dan menjalankan ulang build hingga sukses!*

4. **Jika Ingin Redeploy Manual di Dashboard Vercel**:
   - Buka project Anda di dashboard [vercel.com](https://vercel.com).
   - Masuk ke tab **Deployments**.
   - Klik deployment yang bertanda merah (*Failed*), klik ikon tiga titik `...` di pojok kanan atas, lalu pilih **Redeploy**.
   - Tunggu ~1 menit hingga status berubah menjadi **Ready** (Centang Hijau).
   - Klik domain yang diberikan (contoh: `https://yayasan-bina-asri-kalbar.vercel.app`). Website Anda kini resmi live di seluruh dunia!

---

## BAGIAN 3: Solusi Cepat Jika Ada Galat di Log Vercel

Jika suatu saat Vercel menampilkan pesan galat, Anda dapat memeriksanya di tab **Building** pada halaman deployment:
1. **Galat "vite: command not found" atau "npm error ERESOLVE"**:
   - Pastikan file `package-lock.json` ikut ter-push ke GitHub (`git add package-lock.json package.json && git commit -m "update lockfile" && git push`).
2. **Halaman 404 saat refresh URL (misal `/berita` atau `/admin`)**:
   - Pastikan file `vercel.json` ada di root folder dengan rewrite ke `/index.html` (sudah kami konfigurasi).
3. **Database Supabase Belum Terhubung**:
   - Masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di menu **Settings > Environment Variables** di Vercel, lalu klik **Save** dan **Redeploy**.
   - Atau cukup login ke Panel Admin (`/admin`), buka menu **Database Supabase**, dan masukkan URL & Anon Key di formulir yang tersedia. Kredensial akan langsung aktif!

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
