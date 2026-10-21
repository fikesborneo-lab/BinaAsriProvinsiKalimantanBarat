export interface BankAccount {
  id: number;
  bank: string;
  badge: string;
  norek: string;
  an: string;
}

export interface KontenWeb {
  brand_name: string;
  brand_sub: string;
  logo_bulat: string;
  logo_persegi: string;
  top_address: string;
  top_email: string;
  top_phone: string;
  wa_number: string;
  hero_badge: string;
  hero_title: string;
  hero_desc: string;
  hero_cta_donasi: string;
  hero_cta_program: string;
  hero_cta_kontak: string;
  stat_1_num: string;
  stat_1_label: string;
  stat_2_num: string;
  stat_2_label: string;
  stat_3_num: string;
  stat_3_label: string;
  stat_4_num: string;
  stat_4_label: string;
  profil_tag: string;
  profil_title: string;
  profil_img: string;
  profil_legal: string;
  profil_p1: string;
  profil_p2: string;
  visi_title: string;
  visi_text: string;
  misi_title: string;
  misi_items: string;
  program_tag: string;
  program_title: string;
  program_desc: string;
  berita_tag: string;
  berita_title: string;
  berita_desc: string;
  galeri_tag: string;
  galeri_title: string;
  galeri_desc: string;
  pengurus_tag: string;
  pengurus_title: string;
  pengurus_desc: string;
  donasi_title: string;
  donasi_desc: string;
  donasi_points: string;
  donasi_banks: string; // JSON string or parsed
  kontak_title: string;
  kontak_desc: string;
  kontak_alamat: string;
  kontak_telepon: string;
  kontak_email: string;
  kontak_jam: string;
  footer_desc: string;
  footer_legal: string;
  footer_copyright: string;
}

export interface BeritaItem {
  id: number;
  judul: string;
  tanggal: string;
  rawTanggal?: string;
  kategori: string;
  ringkasan: string;
  konten: string;
  gambar: string;
}

export interface ProgramItem {
  id: number;
  nama: string;
  deskripsi: string;
  target: string;
  progress: number;
}

export interface GaleriItem {
  id: number;
  judul: string;
  gambar: string;
}

export interface CabangDaerah {
  id: string;
  nama: string;
  tipe: 'Kota' | 'Kabupaten' | 'Pusat';
  wilayah: string;
  alamat: string;
  telepon: string;
  penanggungJawab: string;
  jumlahBinaan: string;
  keterangan: string;
}

export interface PengurusItem {
  id: number;
  nama: string;
  jabatan: string;
  foto: string;
  cabang: string; // e.g. "Pusat / Wilayah", "Kota Pontianak", "Kabupaten Kubu Raya", "Kabupaten Mempawah", "Kabupaten Sanggau", "Kabupaten Sintang", "Kabupaten Ketapang", "Kota Singkawang", "Kabupaten Sambas"
  kontak?: string;
}

export interface PesanItem {
  id: number;
  timestamp: string;
  nama: string;
  email: string;
  telepon: string;
  subjek: string;
  pesan: string;
}

export interface AdminUser {
  username: string;
  nama: string;
  role: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  loginTime: string;
}
