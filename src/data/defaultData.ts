import type { KontenWeb, BeritaItem, ProgramItem, GaleriItem, PengurusItem, BankAccount, PesanItem, CabangDaerah } from '../types/index.ts';

export const LOGO_BULAT = 'https://lh3.googleusercontent.com/d/1t_el0P4aHM3gLG4RTDrupVAjYTIaMqMZ';
export const LOGO_PERSEGI = 'https://lh3.googleusercontent.com/d/1BX2QKAod3qOttaebEYTlW61Mx4L5__5Q';

export const DAFTAR_CABANG_DAERAH: CabangDaerah[] = [
  {
    id: 'pusat',
    nama: 'Pusat / SR Kalbar',
    tipe: 'Pusat',
    wilayah: 'Provinsi Kalimantan Barat',
    alamat: 'Jl. Prof. Dr. Hamka, Gg. Nilam 3 No. 14, Pontianak Barat 78115',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Dr. Drs. H. Mardjan, M.Kes (Ketua Yayasan)',
    jumlahBinaan: '88 Mitra Puskesmas & 6 RSUD',
    keterangan: 'Kantor Induk Sub Recipient (SR) Kalimantan Barat Program Eliminasi TBC Global Fund Konsorsium Penabulu-STPI.'
  },
  {
    id: 'pontianak',
    nama: 'Kota Pontianak',
    tipe: 'Kota',
    wilayah: 'Kota Pontianak',
    alamat: 'Jl. Prof. Dr. Hamka, Gg. Nilam 3 No. 14, Pontianak Barat',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kota Pontianak',
    jumlahBinaan: '23 Puskesmas, RSUD Dr. Soedarso & RS Antonius',
    keterangan: 'Wilayah kerja SSR Kota Pontianak meliputi 23 Puskesmas dengan fokus investigasi kontak dan pendampingan pasien TBC hingga sembuh.'
  },
  {
    id: 'kubu-raya',
    nama: 'Kabupaten Kubu Raya',
    tipe: 'Kabupaten',
    wilayah: 'Kabupaten Kubu Raya',
    alamat: 'Sungai Raya Dalam, Kabupaten Kubu Raya (Mitra PPSW Borneo)',
    telepon: '0821-5219-1199',
    penanggungJawab: 'PPSW BORNEO (Mitra SSR Kubu Raya)',
    jumlahBinaan: '15 Puskesmas & Ratusan Kader Komunitas',
    keterangan: 'Pelaksana program SSR TBC di Kubu Raya bersama mitra PPSW Borneo mencakup 15 Puskesmas pesisir dan daratan.'
  },
  {
    id: 'singkawang',
    nama: 'Kota Singkawang',
    tipe: 'Kota',
    wilayah: 'Kota Singkawang',
    alamat: 'Jl. Pemuda No. 18, Singkawang Barat',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kota Singkawang',
    jumlahBinaan: '10 Puskesmas & RSUD Dr. Abdul Aziz',
    keterangan: 'Jaringan layanan penemuan aktif TBC dan penjangkauan komunitas terduga di 10 Puskesmas wilayah Kota Singkawang.'
  },
  {
    id: 'mempawah',
    nama: 'Kabupaten Mempawah',
    tipe: 'Kabupaten',
    wilayah: 'Kabupaten Mempawah',
    alamat: 'Jl. Raden Kusno, Mempawah Hilir',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kab. Mempawah',
    jumlahBinaan: '14 Puskesmas Wilayah Kerja',
    keterangan: 'Pelayanan skrining TBC, investigasi kontak erat serumah, dan edukasi pencegahan stigma di 14 Puskesmas Mempawah.'
  },
  {
    id: 'sanggau',
    nama: 'Kabupaten Sanggau',
    tipe: 'Kabupaten',
    wilayah: 'Kabupaten Sanggau',
    alamat: 'Jl. Jenderal Sudirman, Kapuas, Sanggau',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kab. Sanggau',
    jumlahBinaan: '8 Puskesmas & RSUD Sanggau',
    keterangan: 'Kegiatan edukasi, pemeriksaan dahak massal, dan pendampingan kepatuhan minum obat di 8 wilayah Puskesmas Sanggau.'
  },
  {
    id: 'sintang',
    nama: 'Kabupaten Sintang',
    tipe: 'Kabupaten',
    wilayah: 'Kabupaten Sintang',
    alamat: 'Jl. PKP Mujahidin, Baning Kota, Sintang',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kab. Sintang',
    jumlahBinaan: '9 Puskesmas & RSUD Ade Muhammad Djoen',
    keterangan: 'Pusat rujukan dan investigasi kontak penanggulangan TBC di wilayah perhuluan Kapuas Sintang.'
  },
  {
    id: 'ketapang',
    nama: 'Kabupaten Ketapang',
    tipe: 'Kabupaten',
    wilayah: 'Kabupaten Ketapang',
    alamat: 'Delta Pawan, Kabupaten Ketapang',
    telepon: '0821-5219-1199',
    penanggungJawab: 'Koordinator SSR Kab. Ketapang',
    jumlahBinaan: '9 Puskesmas & RSUD Agoesdjam Ketapang',
    keterangan: 'Penyuluhan aktif, pendampingan pasien mangkir (LTFU), dan jejaring layanan TBC di 9 Puskesmas Ketapang.'
  }
];

export const DEFAULT_BANKS: BankAccount[] = [
  { id: 1, bank: "BANK KALBAR", badge: "Daerah", norek: "1025-00-123456", an: "a.n. YAYASAN BINA ASRI KALBAR" },
  { id: 2, bank: "BANK BRI", badge: "Nasional", norek: "0098-01-002345-50-8", an: "a.n. YAYASAN BINA ASRI" },
  { id: 3, bank: "BANK MANDIRI", badge: "Nasional", norek: "146-00-9876543-2", an: "a.n. YAYASAN BINA ASRI" },
  { id: 4, bank: "BANK SYARIAH (BSI)", badge: "Syariah", norek: "714-567-8901", an: "a.n. YAYASAN BINA ASRI" }
];

export const DEFAULT_KONTEN_WEB: KontenWeb = {
  brand_name: "YAYASAN BINA ASRI",
  brand_sub: "PROVINSI KALIMANTAN BARAT",
  logo_bulat: LOGO_BULAT,
  logo_persegi: LOGO_PERSEGI,
  top_address: "Jl. Prof. Dr. Hamka, Gg. Nilam 3 No.14, Pontianak Barat 78115",
  top_email: "yayasanbinaasrikalbar@gmail.com",
  top_phone: "0821-5219-1199",
  wa_number: "6282152191199",
  hero_badge: "Sub Recipient (SR) Eliminasi TBC Kalimantan Barat | Konsorsium Penabulu-STPI & Global Fund",
  hero_title: "Yayasan Bina Asri Kalimantan Barat",
  hero_desc: "Lembaga kesehatan, kemanusiaan, keagamaan, dan sosial yang berfokus pada penanggulangan Tuberkulosis (TBC), Stunting, dan Kesehatan Reproduksi untuk mewujudkan masyarakat Kalimantan Barat yang sehat, sejahtera, dan bermartabat menuju Indonesia Bebas TBC 2030.",
  hero_cta_donasi: "Salurkan Donasi",
  hero_cta_program: "Program Eliminasi TBC",
  hero_cta_kontak: "Hubungi Sekretariat",
  stat_1_num: "88",
  stat_1_label: "Mitra Puskesmas di 7 Kab/Kota",
  stat_2_num: "791",
  stat_2_label: "Kader Komunitas Terlatih",
  stat_3_num: "7",
  stat_3_label: "Wilayah Kerja SSR se-Kalbar",
  stat_4_num: "100%",
  stat_4_label: "Layanan Kesehatan Bebas Diskriminasi",
  profil_tag: "Sejarah & Legalitas",
  profil_title: "Dari Klinik Bersalin Menjadi Lembaga Pengabdian Kesehatan & Sosial",
  profil_img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1000",
  profil_legal: "Akta Notaris Mada Reni Damanik, SH, MM No. 55 Th 1999 & SK Menkumham RI No. C-1910 HT.01.02.TH 2007",
  profil_p1: "Pada mulanya, Bina Asri merupakan suatu Klinik Bersalin yang dibangun oleh Bapak Dr. Drs. H. Mardjan, M.Kes pada tahun 2003. Respon masyarakat sangat baik terhadap berdirinya klinik ini, sehingga klinik ini berkembang pesat dan maju. Melihat antusiasme serta kebutuhan layanan yang semakin luas, Beliau akhirnya berkeinginan untuk mengembangkan klinik ini menjadi sebuah Yayasan agar semakin banyak membantu dan melayani masyarakat lebih luas lagi.",
  profil_p2: "Yayasan Bina Asri didirikan di Pontianak dan disahkan oleh notaris Mada Reni Damanik, SH, MM melalui Akta No. 55 tertanggal 29 Desember 1999 serta dikukuhkan melalui SK Menteri Hukum dan HAM RI No: C-1910 HT.01.02.TH 2007. Saat ini, Yayasan Bina Asri dipercaya mengemban amanah sebagai Sub Recipient (SR) Program Eliminasi TBC di Provinsi Kalimantan Barat yang didanai oleh Global Fund melalui PR Konsorsium Komunitas Penabulu-STPI, membina jejaring di 7 Kabupaten/Kota bersama 791 kader komunitas dan 88 puskesmas mitra.",
  visi_title: "Visi Lembaga",
  visi_text: "Menjadi lembaga terbaik di bidang kesehatan, kemanusiaan dan sosial yang memberikan pelayanan yang berfokus pada masalah TB, Stunting dan Kesehatan Reproduksi dengan cinta kasih untuk mewujudkan masyarakat sehat, sejahtera, dan bermanfaat.",
  misi_title: "Misi Lembaga",
  misi_items: "Memberikan pelayanan kesehatan kepada masyarakat tanpa membedakan suku, agama, ras, dan golongan.\nMembantu masyarakat yang kurang mampu untuk mendapatkan pendidikan dan pengetahuan secara layak melalui program kerjasama.\nMendukung program pemerintah dalam upaya mensejahterakan masyarakat khususnya dalam bidang kesehatan yang berfokus pada masalah TB, Stunting dan Kesehatan Reproduksi.\nMenjalin kerjasama dengan lembaga lain baik dari unsur pemerintah maupun swasta sesuai dengan tujuan program.\nMenanamkan rasa kesatuan dan persatuan dalam keberagaman.",
  program_tag: "Program Kerja Utama",
  program_title: "Aksi Nyata Penanggulangan TBC & Kesehatan Masyarakat",
  program_desc: "Inisiatif terstruktur Yayasan Bina Asri bersama jejaring faskes dan kader komunitas di seluruh pelosok Provinsi Kalimantan Barat.",
  berita_tag: "Kabar & Publikasi",
  berita_title: "Berita & Dokumentasi Program SR Kalbar",
  berita_desc: "Laporan kegiatan investigasi kontak, pendampingan pasien TBC, advokasi DPPM, dan edukasi kesehatan dari Yayasan Bina Asri.",
  galeri_tag: "Dokumentasi Lapangan",
  galeri_title: "Galeri Aksi Nyata di Lapangan",
  galeri_desc: "Momen pengabdian 791 kader komunitas, skrining kesehatan terduga TBC, senam sehat, dan pertemuan lintas sektor.",
  pengurus_tag: "Struktur & Penggerak",
  pengurus_title: "Susunan Dewan Pembina, Pengurus & Tim SR/SSR",
  pengurus_desc: "Para profesional kesehatan dan pegiat sosial yang mendedikasikan dedikasi untuk eliminasi TBC dan kesehatan Kalimantan Barat.",
  donasi_title: "Dukung Gerakan Kesehatan & Eliminasi TBC Kalbar",
  donasi_desc: "Partisipasi donasi dan infaq Anda menjadi sokongan bagi pendampingan nutrisi pasien TBC pra-sejahtera, operasional kader penjangkauan pelosok, serta santunan kesehatan keluarga dhuafa di Kalimantan Barat.",
  donasi_points: "Dukungan nutrisi dan paket pemulihan pasien TBC pra-sejahtera\nOperasional 791 kader komunitas penjangkauan di 7 Kab/Kota\nLaporan penyaluran transparan dan teraudit\nRekening resmi atas nama institusi Yayasan Bina Asri",
  donasi_banks: JSON.stringify(DEFAULT_BANKS),
  kontak_title: "Sekretariat & Layanan Narahubung",
  kontak_desc: "Kantor sekretariat Yayasan Bina Asri senantiasa terbuka untuk koordinasi kemitraan faskes, konsultasi TBC, permohonan pendampingan, maupun silaturahmi.",
  kontak_alamat: "Jl. Prof. Dr. Hamka, Gg. Nilam 3 No.14, Pontianak Barat, 78115, Kalimantan Barat",
  kontak_telepon: "0821-5219-1199",
  kontak_email: "yayasanbinaasrikalbar@gmail.com",
  kontak_jam: "Senin - Sabtu: 08.00 - 16.30 WIB",
  footer_desc: "Yayasan Bina Asri adalah Sub Recipient (SR) Kalimantan Barat untuk Program Eliminasi TBC di Indonesia. Berkhidmat dalam kesehatan, kemanusiaan, dan kesejahteraan sosial masyarakat.",
  footer_legal: "Akta Notaris Mada Reni Damanik, SH, MM No. 55 / 1999\nSK Kemenkumham RI No. C-1910 HT.01.02.TH 2007\nPortal Resmi: www.binaasrikalbar.com",
  footer_copyright: "Yayasan Bina Asri Provinsi Kalimantan Barat. Seluruh Hak Cipta Dilindungi."
};

export const DEFAULT_BERITA: BeritaItem[] = [
  {
    "id": 1,
    "judul": "Yayasan Bina Asri Membuka Peluang Kerja Sama untuk Mendukung Program Eliminasi TBC di Kalimantan Barat",
    "tanggal": "29 November 2024",
    "rawTanggal": "2024-11-29",
    "kategori": "Kemitraan",
    "ringkasan": "Pontianak, Oktober 2024 – Yayasan Bina Asri, organisasi yang bergerak di bidang kesehatan, kemanusiaan, keagamaan, dan sosial, kembali memperluas kipr...",
    "konten": "Pontianak, Oktober 2024 – Yayasan Bina Asri, organisasi yang bergerak di bidang kesehatan, kemanusiaan, keagamaan, dan sosial, kembali memperluas kiprahnya dalam program eliminasi Tuberkulosis (TBC) di Kalimantan Barat. Sejak tahun 2021, Yayasan Bina Asri telah menjadi mitra penerima dana hibah dari Program Eliminasi TBC Global Fund melalui PR Konsorsium STPI-Penabulu. Program ini berlangsung hingga Desember 2026, meliputi tujuh wilayah intervensi: Kota Pontianak, Singkawang, Kabupaten Kubu Raya, Mempawah, Sanggau, Sintang, dan Ketapang.\nMemasuki tahun 2025-2026, Yayasan Bina Asri mendapatkan mandat untuk memperluas cakupan wilayah kerja dengan melibatkan Sub-Sub Penerima (SSR) baru yang akan beroperasi di Kabupaten Sambas. Program ini diharapkan dapat berjalan hingga akhir tahun 2026 dan semakin memperkuat upaya eliminasi TBC di Kalimantan Barat.\nPeluang Kerja Sama Yayasan Bina Asri kini mengundang individu maupun organisasi untuk mengajukan proposal guna mendukung pelaksanaan program eliminasi TBC di wilayah Kabupaten Sambas.\nPersyaratan dan Ketentuan:\nKirim CV dan proposal ke yayasanbinaasrikalbar @gmail .com Batas waktu pengajuan adalah 30 Oktober 2024, pukul 17.00 WIB Informasi lebih lanjut mengenai program, serta template Expression of Interest (EoI), dapat diunduh melalui tautan berikut: https ://bit .ly /CallforEoLSambas Tentang Yayasan Bina Asri Sebagai organisasi yang menyediakan penyelesaian berbagai masalah kesehatan dan kesejahteraan sosial di masyarakat, Yayasan Bina Asri terus berkomitmen mendukung target Indonesia bebas TBC pada tahun 2030. Melalui kolaborasi dengan berbagai pihak, yayasan ini terus memperluas dampaknya demi menciptakan masyarakat yang lebih sehat, sejahtera, dan inklusif .\nKami mengundang semua pihak yang memiliki kompetensi dan kepedulian terhadap isu TBC untuk bersatu bersama kami dalam mewujudkan perubahan nyata di Kalimantan Barat.\nHubungi Kami:\nEmail: yayasanbinaasrikalbar @gmail .com",
    "gambar": "https://blogger.googleusercontent.com/img/a/AVvXsEh83XutOTQ1d7eWxqc3L-YKE_zAtx2q2leCaZObwxsbo-IcH4IAmvk-t7A7P9C7eRmr9IlcEoBz9I0v0XMVfPx4OL8aTBethEQtxld262_t4q4ZJvxelGWCCZukHh2e6tyBVqXqWuoe_acm8eKapq5Wb0SkX16Hf3mcX_dsVxv1hQpthrc19uhbfu3hjDo"
  },
  {
    "id": 2,
    "judul": "1 Oktober 2024 SR Bina Asri Kalbar melakukan Pertemuan bersama para Pemangku Kepntingan dalam rangka meningkatkan Kualitas Layanan TBC di Kalimantan Barat.",
    "tanggal": "29 November 2024",
    "rawTanggal": "2024-11-29",
    "kategori": "Advokasi",
    "ringkasan": "Pontianak, 1 Oktober 2024 – Sub Penerima (SR) Bina Asri Kalimantan Barat melaksanakan pertemuan penting bersama para pemangku kepentingan di wilayah K...",
    "konten": "Pontianak, 1 Oktober 2024 – Sub Penerima (SR) Bina Asri Kalimantan Barat melaksanakan pertemuan penting bersama para pemangku kepentingan di wilayah Kalimantan Barat. Kegiatan ini bertujuan untuk memperkuat kolaborasi dan meningkatkan kualitas layanan Tuberkulosis (TBC) di provinsi tersebut.\nPertemuan yang berlangsung di [lokasi acara, jika ada] dihadiri oleh berbagai pihak, termasuk perwakilan dari Dinas Kesehatan Kalimantan Barat, fasilitas layanan kesehatan, organisasi masyarakat sipil, hingga kader kesehatan yang aktif dalam upaya pemberantasan TBC.\nDalam sambutannya, Ketua SR Bina Asri Kalbar menekankan pentingnya kerja sama lintas sektor untuk memastikan layanan TBC yang berkualitas, inklusif, dan berkelanjutan. “Tantangan dalam pemberantasan TBC membutuhkan sinergi dari semua pihak. Melalui pertemuan ini, kami berharap dapat menyelaraskan strategi, mengatasi hambatan, dan memperluas akses layanan TBC di Kalimantan Barat,” ungkapnya.\nFokus Diskusi Beberapa poin utama yang dibahas dalam pertemuan ini meliputi:\nPenguatan Sistem Rujukan: membalas pasien TBC mendapatkan layanan yang cepat dan tepat melalui integrasi sistem referensi. Peningkatan Kapasitas Petugas Kesehatan: Penyediaan pelatihan dan supervisi bagi tenaga kesehatan untuk memperbarui pengetahuan tentang diagnosis dan pengobatan TBC. Optimalisasi Pemanfaatan Teknologi: Pemanfaatan aplikasi dan platform digital untuk menyatukan dan melaporkan kasus TBC secara real-time. Kolaborasi dengan Komunitas: Menggalang peran masyarakat dalam deteksi dini dan edukasi terkait pencegahan TBC.\nKomitmen Bersama Pertemuan ini menghasilkan sejumlah kesepakatan untuk mendukung program eliminasi TBC di Kalimantan Barat. Para peserta sepakat untuk memperkuat kerja sama dalam mengatasi hambatan operasional, memperluas jangkauan layanan, serta meningkatkan kesadaran masyarakat mengenai pentingnya pengobatan TBC yang tuntas.\n“Dengan pendekatan terpadu, kami optimis upaya pemberantasan TBC di Kalimantan Barat dapat berjalan lebih efektif. Ke depan, kolaborasi ini akan terus kami tingkatkan,” tutup perwakilan Dinas Kesehatan.\nKegiatan ini merupakan bagian dari komitmen SR Bina Asri Kalbar dalam mendukung target Indonesia bebas TBC pada tahun 2030. Dengan dukungan dan kerja sama yang solid dari semua pihak, diharapkan kualitas layanan TBC di Kalimantan Barat akan semakin baik dan mampu menjangkau seluruh lapisan masyarakat.",
    "gambar": "https://blogger.googleusercontent.com/img/a/AVvXsEimWddmmsQ2I_rst8_cmAMvOclysk68Rs7Zzcw1-_m5u_n6hgk2DKZpZZq7HEPnsWo2I1s5u33RCBlvdxgMRff-Kwpm8wC8D4E1EcZbrGaNqt1GVsZUWPKZ_3hn6gkABEzFK8Pf3keuZ_A9CPGyCIgn4pvFPbd2f2sXAQ00xUokPZh8qZaxDisWCZ5e_9Q"
  },
  {
    "id": 3,
    "judul": "Hotline Kesehatan Mental: Sahabat Baru Pasien TBC di Kalimantan Barat",
    "tanggal": "8 Agustus 2024",
    "rawTanggal": "2024-08-08",
    "kategori": "Pendampingan",
    "ringkasan": "Bagi pasien TBC di Kalimantan Barat, kini ada kabar baik. Sebuah layanan hotline kesehatan mental telah diluncurkan, memberikan akses mudah bagi merek...",
    "konten": "Bagi pasien TBC di Kalimantan Barat, kini ada kabar baik. Sebuah layanan hotline kesehatan mental telah diluncurkan, memberikan akses mudah bagi mereka yang membutuhkan dukungan emosional selama menjalani pengobatan. Cukup dengan memindai kode QR yang telah disediakan, pasien dapat langsung terhubung dengan responder hotline yang siap mendengarkan dan memberikan bantuan.\nMengapa Hotline Kesehatan Mental Penting untuk Pasien TBC?\nMengidap TBC tidak hanya berdampak pada kesehatan fisik, tetapi juga dapat memicu berbagai masalah psikologis seperti kecemasan, depresi, dan perasaan isolasi. Pasien TBC seringkali merasa khawatir tentang masa depan mereka, stigma sosial yang mungkin mereka hadapi, dan efek samping pengobatan.\nHotline kesehatan mental hadir sebagai solusi untuk mengatasi masalah-masalah tersebut. Melalui layanan ini, pasien dapat:\nBerbagi perasaan dan pikiran: Pasien dapat dengan bebas mengungkapkan perasaan dan pikiran mereka tanpa takut dihakimi. Mendapatkan dukungan emosional: Responder hotline akan memberikan dukungan emosional yang dibutuhkan pasien untuk menghadapi tantangan dalam pengobatan. Mendapatkan informasi yang akurat: Pasien dapat mendapatkan informasi yang akurat tentang TBC, pengobatan, dan cara mengelola stres. Dirujuk ke layanan kesehatan mental yang lebih lanjut: Jika diperlukan, pasien akan dirujuk ke layanan kesehatan mental yang lebih komprehensif. Cara Mengakses Layanan Hotline\nUntuk mengakses layanan hotline kesehatan mental, pasien TBC cukup memindai kode QR yang biasanya terdapat di fasilitas kesehatan atau materi edukasi tentang TBC. Kode QR ini akan menghubungkan pasien langsung dengan responder hotline di wilayah Kalimantan Barat.\nPentingnya Dukungan Komunitas\nSelain layanan hotline, dukungan dari keluarga, teman, dan komunitas juga sangat penting bagi kesembuhan pasien TBC. Dengan adanya dukungan sosial yang kuat, pasien akan merasa lebih termotivasi untuk menjalani pengobatan dan mencapai kesembuhan.\n#responderhotline #poptbindonesia #tbckomunitas #tuberculosis #layanankonseling #pasientbc",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi4InRR_IWPk4Dv8lYLkQaH_TjPPWdZ-DJXQJwWffNpF02YLuaSOHni6gZCgNONNhwzB7hyphenhyphenKW661ifa-gXkvCxjfWTODIPb79VLaZBd9H7tLyRjxhXVJd2aVnYSnMtOInQ0xfyBVvc5da2O5zmTQwn0pYx16lk5cfjN3SknigWhyphenhyphen3MEX5SxPwr1TjzxfMw/w400-h366/B1.png"
  },
  {
    "id": 4,
    "judul": "SR Kalimantan Barat Siapkan Transisi Lancar di SSR Kota Singkawang",
    "tanggal": "8 Agustus 2024",
    "rawTanggal": "2024-08-08",
    "kategori": "Advokasi",
    "ringkasan": "Singkawang, 3-4 Mei 2024 – SR Kalimantan Barat mengadakan kegiatan supervisi intensif di SSR Kota Singkawang. Kegiatan ini bertujuan untuk mempersiapk...",
    "konten": "Singkawang, 3-4 Mei 2024 – SR Kalimantan Barat mengadakan kegiatan supervisi intensif di SSR Kota Singkawang. Kegiatan ini bertujuan untuk mempersiapkan transisi dan penyerahan tugas (handover) staf SSR yang ada serta merekrut tenaga kesehatan baru yang akan fokus pada penanganan TBC Resisten Obat (RO).\nPersiapan Matang untuk Masa Depan\nTransisi staf dan perekrutan tenaga kesehatan baru merupakan langkah penting untuk memastikan kontinuitas pelayanan kesehatan, khususnya dalam penanganan TBC RO. Melalui kegiatan supervisi ini, SR Kalimantan Barat ingin memastikan bahwa proses transisi berjalan dengan lancar dan tidak mengganggu pelayanan pasien.\nFokus Kegiatan Supervisi\nSelama dua hari, tim supervisi dari SR Kalimantan Barat melakukan berbagai kegiatan, antara lain:\nEvaluasi kinerja: Melakukan evaluasi terhadap kinerja staf SSR yang ada, mengidentifikasi kekuatan dan kelemahan, serta merumuskan rencana pengembangan kapasitas. Pembentukan tim baru: Memfasilitasi pembentukan tim baru yang akan menangani pasien TBC RO, termasuk melakukan seleksi dan wawancara calon tenaga kesehatan. Pelatihan teknis: Memberikan pelatihan teknis kepada calon tenaga kesehatan baru mengenai tata cara penanganan pasien TBC RO, termasuk diagnosis, pengobatan, dan pemantauan. Standarisasi prosedur: Memastikan bahwa semua prosedur dan standar operasional prosedur (SOP) yang terkait dengan penanganan TBC RO sudah sesuai dengan pedoman nasional. Pentingnya Penanganan TBC RO\nTBC RO merupakan jenis TBC yang resisten terhadap obat-obatan lini pertama. Penyakit ini membutuhkan penanganan khusus dan pengobatan yang lebih lama dibandingkan dengan TBC biasa. Oleh karena itu, sangat penting untuk memiliki tenaga kesehatan yang kompeten dan berkomitmen dalam menangani pasien TBC RO.\nTujuan Akhir: Pelayanan Kesehatan yang Lebih Baik\nTujuan akhir dari kegiatan supervisi ini adalah untuk meningkatkan kualitas pelayanan kesehatan bagi pasien TBC RO di Kota Singkawang. Dengan adanya tenaga kesehatan yang kompeten dan sistem yang terstandarisasi, diharapkan pasien TBC RO dapat mendapatkan pengobatan yang tepat dan mencapai kesembuhan.",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg64RzM2zdRxTqrOFHtv5DFNjRAHbMqCReHOtfl41ed5J332VRCKuOA0XEx5YMxu9Tz9fQWPwjOLfUdcHCbqIemEWNcKHWR_jC9aAfrjXVR7zfq1OGCXl0qQo-tcEcJHnlrPJXDT7-tE-CRlJLidtkbXQjwryVHdoXPab02dkAeuQ8tscXzF96YkYqv4m4/w400-h366/B1.png"
  },
  {
    "id": 5,
    "judul": "SR Kalimantan Barat Dukung Pasien TBC RO di Pontianak",
    "tanggal": "19 Maret 2024",
    "rawTanggal": "2024-03-19",
    "kategori": "Pendampingan",
    "ringkasan": "Pontianak, 19 Maret 2024 – SR Kalimantan Barat kembali menunjukkan kepeduliannya terhadap kesehatan masyarakat dengan aktif berpartisipasi dalam Perte...",
    "konten": "Pontianak, 19 Maret 2024 – SR Kalimantan Barat kembali menunjukkan kepeduliannya terhadap kesehatan masyarakat dengan aktif berpartisipasi dalam Pertemuan Dukungan untuk Pasien TBC Resisten Obat (RO) yang diselenggarakan oleh SSR Kota Pontianak. Pertemuan ini bertujuan untuk memberikan dukungan moral dan informasi yang dibutuhkan oleh pasien TBC RO dalam menjalani pengobatan yang panjang dan kompleks.\nTBC RO merupakan jenis TBC yang resisten terhadap obat-obatan lini pertama. Penyakit ini membutuhkan penanganan khusus dan pengobatan yang lebih lama dibandingkan dengan TBC biasa. Oleh karena itu, dukungan dari berbagai pihak sangat penting untuk membantu pasien TBC RO agar tetap semangat menjalani pengobatan dan mencapai kesembuhan.\nPeran SR Kalimantan Barat\nDalam pertemuan ini, SR Kalimantan Barat berperan sebagai fasilitator dan penyedia informasi. Beberapa kegiatan yang dilakukan oleh SR Kalimantan Barat antara lain:\nMemberikan edukasi: SR Kalimantan Barat memberikan edukasi kepada pasien dan keluarga tentang TBC RO, pentingnya pengobatan yang teratur, dan cara mengatasi efek samping obat. Menyediakan konseling: Para konselor dari SR Kalimantan Barat memberikan konseling kepada pasien dan keluarga untuk membantu mereka mengatasi masalah psikologis yang mungkin timbul akibat penyakit ini. Membangun jejaring: SR Kalimantan Barat memfasilitasi terbentuknya kelompok pendukung sesama pasien TBC RO. Hal ini bertujuan untuk memberikan dukungan sosial dan emosional bagi pasien. Pentingnya Dukungan untuk Pasien TBC RO\nDukungan dari berbagai pihak sangat penting untuk membantu pasien TBC RO dalam menjalani pengobatan. Dengan adanya dukungan, pasien akan merasa lebih termotivasi untuk terus berjuang melawan penyakitnya. Selain itu, dukungan juga dapat membantu pasien untuk mengatasi stigma sosial yang seringkali dialami oleh penderita TBC.",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9lbYb42JRYF0jMPorKZzdJpOZ2r5FgTWlx0Pyq3N3D5MAba8wZHDamGphzcEgGEuo_IhyZKzrR5873eQJhIqUlcm0BFhSQJNRlz7yXjYKv4g8_9xXVbz5vCOsBOhHpOaN628hFPpJDX4-mdRTez_frwu-90a2kYCeVLvR6xO-yRcEQki39VaqBI3845k/w400-h366/B1.png"
  },
  {
    "id": 6,
    "judul": "SR Bina Asri Kalbar Dukung Suksesnya Rakorda di Kota Pontianak",
    "tanggal": "24 Februari 2024",
    "rawTanggal": "2024-02-24",
    "kategori": "Pendampingan",
    "ringkasan": "Pontianak, 12 Februari 2024 – SR Bina Asri Kalimantan Barat kembali menunjukkan komitmennya dalam meningkatkan kesehatan masyarakat dengan aktif berpa...",
    "konten": "Pontianak, 12 Februari 2024 – SR Bina Asri Kalimantan Barat kembali menunjukkan komitmennya dalam meningkatkan kesehatan masyarakat dengan aktif berpartisipasi dalam Rapat Koordinasi Daerah (Rakorda) yang diselenggarakan di Kota Pontianak. Kegiatan yang berlangsung pada hari ini bertujuan untuk menyatukan visi dan misi dalam upaya meningkatkan kualitas layanan kesehatan, khususnya dalam penanganan [masukkan fokus utama Rakorda, misal: penyakit tidak menular, kesehatan ibu dan anak, atau lainnya].\nSebagai salah satu lembaga yang peduli dengan kesehatan masyarakat, SR Bina Asri hadir untuk memberikan dukungan penuh terhadap pelaksanaan Rakorda. Peran aktif SR Bina Asri dalam kegiatan ini meliputi:\nPenyediaan data dan informasi: SR Bina Asri memberikan data dan informasi terkini terkait kondisi kesehatan masyarakat di wilayah Kalimantan Barat, khususnya di Kota Pontianak. Data ini sangat berguna sebagai bahan evaluasi dan perencanaan program-program kesehatan ke depan. Partisipasi dalam diskusi: Perwakilan SR Bina Asri turut aktif dalam diskusi bersama para pemangku kepentingan, seperti pemerintah daerah, dinas kesehatan, rumah sakit, dan organisasi masyarakat. Diskusi ini bertujuan untuk merumuskan strategi bersama dalam mengatasi masalah kesehatan yang dihadapi masyarakat. Sharing best practices: SR Bina Asri membagikan pengalaman dan praktik terbaik dalam pelaksanaan program-program kesehatan yang telah dilakukan. Hal ini diharapkan dapat menginspirasi pihak lain untuk menerapkan program-program serupa. [ Tambahkan kutipan dari perwakilan SR Bina Asri atau peserta Rakorda ]\n[Tambahkan foto-foto kegiatan Rakorda]\nMelalui partisipasinya dalam Rakorda, SR Bina Asri berharap dapat berkontribusi dalam meningkatkan kualitas hidup masyarakat Kalimantan Barat. Dengan adanya sinergi antara berbagai pihak, diharapkan upaya-upaya untuk mengatasi masalah kesehatan dapat berjalan lebih efektif dan efisien.",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgjCirqRFYwVQFP9vVX7SPMzjRDowsFEv-UL1jrvhn-z1JpM3VVK2FLhTZNurQsYuzZk7fAY3G7J4dx9AMOOgPvOt-xvlqGfQNx-1gDlOlavnMKj6-dE0WeR-QNovb5sLm0zxIq-wX3TXeCL_aSvXGyWvd2eWqnB2eW2dC08VHzpCmc2lA-FFjsFPRn5AM/w400-h365/B1.png"
  },
  {
    "id": 7,
    "judul": "Kerjasama FIKES UM Pontianak dan Yayasan Bina Asri Dukung Pemberdayaan Masyarakat",
    "tanggal": "29 Juli 2022",
    "rawTanggal": "2022-07-29",
    "kategori": "Kemitraan",
    "ringkasan": "Pontianak, 29 Juli 2022 – Fakultas Ilmu Kesehatan (FIK) Universitas Muhammadiyah Pontianak (Unmuh) resmi menjalin kerjasama dengan Yayasan Bina Asri....",
    "konten": "Pontianak, 29 Juli 2022 – Fakultas Ilmu Kesehatan (FIK) Universitas Muhammadiyah Pontianak (Unmuh) resmi menjalin kerjasama dengan Yayasan Bina Asri. Penandatanganan kesepakatan kerjasama ini dilakukan di Kota Pontianak dan menandai tonggak baru dalam upaya pemberdayaan melalui masyarakat penelitian, pengabdian, dan kemitraan.\nKerjasama ini diinisiasi oleh kedua belah pihak dengan tujuan untuk saling mendukung dan memperkuat kegiatan di bidang kesehatan. Dekan FIK Unmuh Pontianak, Ismael Saleh, SKM, M.Sc , menyatakan bahwa kerjasama ini akan membuka peluang yang sangat luas bagi mahasiswa dan dosen untuk melakukan penelitian dan pengabdian masyarakat yang lebih terarah dan berdampak.\n“Melalui kerjasama ini, kami berharap dapat memberikan kontribusi nyata bagi masyarakat, khususnya di bidang kesehatan. Mahasiswa akan mendapatkan kesempatan untuk belajar langsung di lapangan dan menerapkan ilmu yang telah diperoleh, ” ujar Ismael Saleh.\nSenada dengan hal tersebut, Ketua Umum Yayasan Bina Asri, Marlenywati, S.Si , M.K.M , menyambut baik kerjasama ini. Ia berharap kerjasama ini dapat meningkatkan kualitas hidup masyarakat melalui berbagai program kesehatan yang akan dilaksanakan bersama.\n“Kami sangat antusias dengan kerjasama ini. Yayasan Bina Asri memiliki banyak program pemberdayaan masyarakat yang membutuhkan dukungan dari tenaga profesional di bidang kesehatan. Dengan adanya kerjasama ini, kami yakin program-program kami akan semakin efektif, ” ungkap Marlenywati.\nRuang Lingkup Kerjasama\nAdapun ruang lingkup kerjasama antara FIK Unmuh Pontianak dan Yayasan Bina Asri meliputi:\nPenelitian bersama: Melaksanakan penelitian yang relevan dengan kebutuhan masyarakat dan pengembangan ilmu pengetahuan. Pengabdian kepada masyarakat: Melaksanakan kegiatan pengabdian masyarakat di bidang kesehatan, seperti penyuluhan kesehatan, pemeriksaan kesehatan gratis, dan program kesehatan lainnya. Kemitraan dalam pelaksanaan program: Saling bertukar informasi dan sumber daya untuk mendukung pelaksanaan program masing-masing pihak. Pembinaan mahasiswa: Memberikan kesempatan bagi mahasiswa untuk melakukan praktik kerja lapangan di lembaga-lembaga yang terkait dengan Yayasan Bina Asri. Harapan Ke Depan\nKerjasama antara FIK Unmuh Pontianak dan Yayasan Bina Asri diharapkan dapat memberikan manfaat yang signifikan bagi kedua belah pihak, serta masyarakat luas. Dengan sinergi yang kuat, diharapkan dapat tercipta solusi inovatif untuk mengatasi berbagai permasalahan kesehatan di masyarakat.\n#FIKUnmuhPontianak #YayasanBinaAsri #Kerjasama #PemberdayaanMasyarakat #Kesehatan",
    "gambar": "https://blogger.googleusercontent.com/img/a/AVvXsEhZ4l9YBsheUaGNDQsoM_3YU1GkVEFWm0OdzrqjjmHAK2iclAo2QeP-NqQujXUPg2rCIu9W0Kw7uKD1wwFl2mYO4s_oP01gmE6ODln1xGC9hV_U2qyCHNzIvwBaCraHf7joYYx6zmHh8YlTzP8QRNyj2i_J7Ls3YKTe_8sYzMCTXjlKA1erkUY-FPgSV_Y"
  },
  {
    "id": 8,
    "judul": "Yayasan Bina Asri Ajak Lindungi Anak dari TBC di Hari Anak Nasional",
    "tanggal": "23 Juli 2022",
    "rawTanggal": "2022-07-23",
    "kategori": "Sosial",
    "ringkasan": "Pontianak, 23 Juli 2022 – Dalam rangka memperingati Hari Anak Nasional, Yayasan Bina Asri kembali mengingatkan masyarakat akan pentingnya menjaga kese...",
    "konten": "Pontianak, 23 Juli 2022 – Dalam rangka memperingati Hari Anak Nasional, Yayasan Bina Asri kembali mengingatkan masyarakat akan pentingnya menjaga kesehatan anak, terutama dari ancaman penyakit Tuberkulosis (TBC). TBC, yang sering dianggap sebagai penyakit orang dewasa, ternyata juga dapat menyerang anak-anak.\nTBC Anak: Ancaman Serius\nAnak-anak, terutama yang berusia di bawah lima tahun, memiliki risiko lebih tinggi terinfeksi TBC. Gejala TBC pada anak seringkali tidak khas, sehingga sulit dideteksi sejak dini. Jika tidak segera ditangani, TBC dapat menyebabkan komplikasi serius bahkan kematian.\nPentingnya TPT untuk Anak\nSalah satu cara efektif untuk mencegah TBC pada anak adalah dengan memberikan Terapi Pencegahan TBC (TPT). TPT merupakan pemberian obat-obatan khusus untuk anak yang telah terpapar bakteri TBC, tetapi belum menunjukkan gejala penyakit. Dengan TPT, risiko anak untuk jatuh sakit akibat TBC dapat ditekan secara signifikan.\nKampanye Kesadaran Masyarakat\nDalam rangka meningkatkan pemahaman masyarakat mengenai TBC pada anak dan pentingnya TPT, Yayasan Bina Asri secara aktif melakukan berbagai kegiatan kampanye. Kegiatan ini meliputi:\nSosialisasi ke sekolah-sekolah: Memberikan edukasi kepada siswa, guru, dan orang tua tentang TBC anak dan TPT.\nPemeriksaan kesehatan gratis: Menyediakan layanan pemeriksaan kesehatan gratis untuk anak-anak, termasuk pemeriksaan TBC.\nPenyebaran informasi melalui media sosial: Memanfaatkan platform media sosial untuk menyebarkan informasi tentang TBC anak dan TPT.\nAjakan untuk Bertindak\n“TBC tidak pandang usia, termasuk anak-anak. Mari kita bersama-sama melindungi anak-anak kita dari ancaman TBC dengan memberikan mereka perlindungan yang terbaik,” ujar [Nama perwakilan Yayasan Bina Asri].\nYayasan Bina Asri mengajak seluruh lapisan masyarakat untuk turut serta dalam upaya pencegahan TBC pada anak. Dengan memberikan perhatian yang lebih pada kesehatan anak dan menerapkan langkah-langkah pencegahan yang tepat, kita dapat menciptakan generasi muda yang sehat dan kuat.\n#TemukanObatiSampaiSembuh #TOSSTBC",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhMRbMc3xRlt21d0IvUic07wtJctBOlXH-6QrGM5lEevxWzlmAUy-PrKwyoNKscASer_Yvp2tKW5nPi7Fv-A69q56yGaKKkWweKdhYRFGLhV7BPhT4xwIt8C-uub_bujtTXkv-pn-wOQphTE-GrDcuUltAeMA3IaAzz9vTyIvaQW7Mpvx6ySaAscXoPFT0/w400-h365/B1.png"
  },
  {
    "id": 9,
    "judul": "Yayasan Bina Asri Sampaikan Progress Update Penanganan TBC di Kalbar",
    "tanggal": "24 Juni 2022",
    "rawTanggal": "2022-06-24",
    "kategori": "Pendampingan",
    "ringkasan": "Pontianak, 24 Juni 2022 – Dalam upaya bersama memerangi penyakit Tuberkulosis (TBC), Dinas Kesehatan Provinsi Kalimantan Barat (Kalbar), RSUD Sudarso,...",
    "konten": "Pontianak, 24 Juni 2022 – Dalam upaya bersama memerangi penyakit Tuberkulosis (TBC), Dinas Kesehatan Provinsi Kalimantan Barat (Kalbar), RSUD Sudarso, TO PPM, dan pelaksana program TBC SR baru saja menggelar pertemuan enam bulanan. Pertemuan yang dihadiri oleh berbagai pemangku kepentingan ini bertujuan untuk mengevaluasi capaian program, mengidentifikasi tantangan, serta merumuskan strategi untuk meningkatkan penanganan TBC di wilayah Kalbar.\nSalah satu poin penting dalam pertemuan ini adalah pemaparan laporan hasil capaian Progress Update periode satu semester yang disampaikan oleh SR TB Komunitas Yayasan Bina Asri. Laporan tersebut memberikan gambaran yang jelas mengenai perkembangan program penanganan TBC, termasuk upaya-upaya yang telah dilakukan untuk mencapai target yang ditetapkan.\nSelain itu, peserta pertemuan juga membahas berbagai tantangan yang dihadapi dalam penanganan TBC, seperti kesulitan dalam melacak pasien yang putus pengobatan (Lost to Follow-up/LTFU) dan proses investigasi kontak yang kompleks. Untuk mengatasi tantangan tersebut, para peserta merumuskan sejumlah strategi dan rencana aksi yang akan dilaksanakan dalam waktu dekat.\nSinergi Program dan Kegiatan\nPertemuan ini juga menghasilkan kesepakatan untuk memperkuat sinergi program dan kegiatan antara berbagai pihak yang terlibat. Beberapa hal yang menjadi fokus utama adalah:\nIntensifikasi kegiatan Komunikasi, Informasi, dan Edukasi (KIE) untuk meningkatkan kesadaran masyarakat tentang TBC dan pentingnya pengobatan yang tuntas. Peningkatan kapasitas tenaga kesehatan dalam mendiagnosis dan merawat pasien TBC. Penguatan sistem rujukan untuk memastikan pasien TBC mendapatkan penanganan yang tepat sesuai dengan tingkat keparahan penyakitnya. Peningkatan kerjasama dengan komunitas untuk melibatkan masyarakat secara aktif dalam upaya pencegahan dan pengendalian TBC. Strategi Penemuan Kasus Baru\nSalah satu topik utama yang dibahas adalah strategi penemuan kasus baru TBC. Para peserta sepakat untuk meningkatkan upaya pelacakan LTFU dan mendorong pasien untuk kembali ke layanan. Selain itu, akan dilakukan pula kegiatan skrining TBC secara aktif di kelompok-kelompok berisiko tinggi.\nTimeline Pelaksanaan\nUntuk memastikan keberhasilan pelaksanaan rencana aksi, peserta pertemuan juga menyusun timeline yang jelas. Setiap pihak yang terlibat akan bertanggung jawab atas pelaksanaan tugas dan melaporkan perkembangannya secara berkala.\nHarapan ke Depan\nDengan adanya kolaborasi yang kuat antara berbagai pihak, diharapkan upaya penanganan TBC di Kalbar dapat semakin efektif. Melalui pertemuan ini, telah terjalin komitmen bersama untuk terus berupaya menurunkan angka penderita TBC dan mewujudkan Kalbar yang bebas dari TBC.",
    "gambar": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh7uG2yxEVqw6KGsr1WZhZH3fNzPJdbP-OgOorjX-wtMpRejS6lRMDBS_Rksm1On5fNfcK6fli8XmNNeJtIjxM2Xnq9aThpPLgRa_XcYeSHE_0gbrDhA_cguJeFdM29ir8IxLSqwkoH_7Y1GeAHK7ru1u5AdGWOZn8oIVkf9J_wouXRPlZIscTzrKbCV2k/w563-h385/B1.png"
  }
];

export const DEFAULT_PROGRAM: ProgramItem[] = [
  {
    id: 1,
    nama: "Investigasi Kontak Erat & Penemuan Terduga TBC Aktif",
    deskripsi: "Sosialisasi aktif, skrining gejala di tempat umum (pasar tradisional, kampus, ponpes), dan investigasi kontak erat serumah pasien TBC di 88 Puskesmas.",
    target: "1.174 Investigasi Kontak (Tercapai 838)",
    progress: 71
  },
  {
    id: 2,
    nama: "Pendampingan Pasien TBC & Pasien Mangkir (LTFU) Hingga Sembuh",
    deskripsi: "Pendampingan konseling minum obat (PMO), pemantauan efek samping, dukungan nutrisi, dan pelacakan pasien Lost to Follow Up agar sembuh tuntas.",
    target: "870 Notifikasi Kasus Baru (Tercapai 398)",
    progress: 46
  },
  {
    id: 3,
    nama: "Pembinaan & Penguatan Kapasitas 791 Kader Komunitas TBC",
    deskripsi: "Pelatihan teknis komunikasi interpersonal, etika penjangkauan tanpa diskriminasi, dan pelaporan digital bagi 791 kader komunitas di 7 Kab/Kota.",
    target: "791 Kader Terlatih",
    progress: 90
  },
  {
    id: 4,
    nama: "Advokasi District-Based Public-Private Mix (DPPM) & Kemitraan Faskes",
    deskripsi: "Membangun jejaring kolaborasi antara Dinas Kesehatan Kalbar, 88 Puskesmas, dan 6 RS Rujukan (RSUD Dr. Soedarso, RS Antonius, dll).",
    target: "88 Puskesmas & 6 RS Rujukan",
    progress: 80
  }
];

export const DEFAULT_GALERI: GaleriItem[] = [
  { id: 1, judul: "Pertemuan Implementasi DPPM Layanan TBC Kalimantan Barat", gambar: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800" },
  { id: 2, judul: "Skrining Kesehatan & Investigasi Kontak TBC Kader Komunitas", gambar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800" },
  { id: 3, judul: "Penyuluhan Bahaya TBC & Pencegahan Stunting di Masyarakat", gambar: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800" },
  { id: 4, judul: "Koordinasi Program SSR Kubu Raya bersama PPSW Borneo", gambar: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800" },
  { id: 5, judul: "Kunjungan Rumah & Pendampingan Pasien Minum Obat (PMO)", gambar: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800" },
  { id: 6, judul: "Senam Bersama & Sosialisasi Perilaku Hidup Bersih dan Sehat", gambar: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800" }
];

export const DEFAULT_PENGURUS: PengurusItem[] = [
  // 1. PUSAT / WILAYAH KALIMANTAN BARAT (SR KALBAR)
  {
    id: 101,
    nama: "Dr. Drs. H. Mardjan, M.Kes",
    jabatan: "Ketua Dewan Pembina & Pendiri Yayasan Bina Asri",
    cabang: "Pusat / SR Kalbar",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 102,
    nama: "Koordinator Program SR Kalbar",
    jabatan: "Program Coordinator Eliminasi TBC",
    cabang: "Pusat / SR Kalbar",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 103,
    nama: "Koordinator M&E SR Kalbar",
    jabatan: "Monitoring, Evaluation & Learning (MEL)",
    cabang: "Pusat / SR Kalbar",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 104,
    nama: "Koordinator Finance & Admin",
    jabatan: "Finance, Admin & Logistik Program",
    cabang: "Pusat / SR Kalbar",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    kontak: "0821-5219-1199"
  },

  // 2. KOTA PONTIANAK (SSR PONTIANAK)
  {
    id: 201,
    nama: "Koordinator SSR Kota Pontianak",
    jabatan: "Penanggung Jawab SSR Pontianak",
    cabang: "Kota Pontianak",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 202,
    nama: "Staf Program & M&E Pontianak",
    jabatan: "Pengelola Data 23 Puskesmas Mitra",
    cabang: "Kota Pontianak",
    foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
    kontak: "0821-5219-1199"
  },

  // 3. KABUPATEN KUBU RAYA (MITRA PPSW BORNEO)
  {
    id: 301,
    nama: "Koordinator SSR PPSW Borneo",
    jabatan: "Penanggung Jawab SSR Kubu Raya",
    cabang: "Kabupaten Kubu Raya",
    foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 302,
    nama: "Koordinator Lapangan Kader Kubu Raya",
    jabatan: "Penggerak Kader 15 Puskesmas",
    cabang: "Kabupaten Kubu Raya",
    foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300",
    kontak: "0821-5219-1199"
  },

  // 4. KOTA SINGKAWANG (SSR SINGKAWANG)
  {
    id: 401,
    nama: "Koordinator SSR Kota Singkawang",
    jabatan: "Penanggung Jawab SSR Singkawang",
    cabang: "Kota Singkawang",
    foto: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 402,
    nama: "Fasilitator Komunitas Singkawang",
    jabatan: "Pendamping Pasien & 10 Puskesmas",
    cabang: "Kota Singkawang",
    foto: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300",
    kontak: "0821-5219-1199"
  },

  // 5. KABUPATEN MEMPAWAH (SSR MEMPAWAH)
  {
    id: 501,
    nama: "Koordinator SSR Kab. Mempawah",
    jabatan: "Penanggung Jawab SSR Mempawah",
    cabang: "Kabupaten Mempawah",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 502,
    nama: "Pendamping Pasien TBC Mempawah",
    jabatan: "Fasilitator 14 Puskesmas Wilayah",
    cabang: "Kabupaten Mempawah",
    foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    kontak: "0821-5219-1199"
  },

  // 6. KABUPATEN SANGGAU (SSR SANGGAU)
  {
    id: 601,
    nama: "Koordinator SSR Kab. Sanggau",
    jabatan: "Penanggung Jawab SSR Sanggau",
    cabang: "Kabupaten Sanggau",
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 602,
    nama: "Fasilitator Kader Sanggau",
    jabatan: "Pengelola 8 Puskesmas & RSUD Sanggau",
    cabang: "Kabupaten Sanggau",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
    kontak: "0821-5219-1199"
  },

  // 7. KABUPATEN SINTANG (SSR SINTANG)
  {
    id: 701,
    nama: "Koordinator SSR Kab. Sintang",
    jabatan: "Penanggung Jawab SSR Sintang",
    cabang: "Kabupaten Sintang",
    foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 702,
    nama: "Fasilitator Lapangan Sintang",
    jabatan: "Pengelola 9 Puskesmas Hulu Kapuas",
    cabang: "Kabupaten Sintang",
    foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300",
    kontak: "0821-5219-1199"
  },

  // 8. KABUPATEN KETAPANG (SSR KETAPANG)
  {
    id: 801,
    nama: "Koordinator SSR Kab. Ketapang",
    jabatan: "Penanggung Jawab SSR Ketapang",
    cabang: "Kabupaten Ketapang",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    kontak: "0821-5219-1199"
  },
  {
    id: 802,
    nama: "Fasilitator Penjangkauan Ketapang",
    jabatan: "Pengelola 9 Puskesmas & RSUD Agoesdjam",
    cabang: "Kabupaten Ketapang",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    kontak: "0821-5219-1199"
  }
];

export const DEFAULT_PESAN: PesanItem[] = [
  {
    id: 1,
    timestamp: "15 Oktober 2026, 14:20 WIB",
    nama: "Ibu Maryam",
    email: "maryam@gmail.com",
    telepon: "082152191199",
    subjek: "Informasi Skrining TBC",
    pesan: "Assalamu'alaikum Yayasan Bina Asri, saya ingin menanyakan prosedur skrining TBC gratis dan pemeriksaan kontak erat untuk keluarga saya di Pontianak Barat."
  }
];
