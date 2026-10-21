import React, { useState, useEffect } from 'react';
import { useFoundation } from '../../context/FoundationContext';
import { BeritaItem, ProgramItem, PengurusItem, BankAccount, KontenWeb } from '../../types';
import { X, Save } from 'lucide-react';

/* =========================================================================
   1. BERITA FORM MODAL (Add / Edit)
   ========================================================================= */
interface BeritaModalProps {
  isOpen: boolean;
  item: BeritaItem | null;
  onClose: () => void;
}

export const BeritaFormModal: React.FC<BeritaModalProps> = ({ isOpen, item, onClose }) => {
  const { addBerita, updateBerita } = useFoundation();
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('Sosial');
  const [rawTanggal, setRawTanggal] = useState('');
  const [gambar, setGambar] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [konten, setKonten] = useState('');

  useEffect(() => {
    if (item) {
      setJudul(item.judul || '');
      setKategori(item.kategori || 'Sosial');
      setRawTanggal(item.rawTanggal || '');
      setGambar(item.gambar || '');
      setRingkasan(item.ringkasan || '');
      setKonten(item.konten || '');
    } else {
      setJudul('');
      setKategori('Sosial');
      setRawTanggal(new Date().toISOString().split('T')[0]);
      setGambar('');
      setRingkasan('');
      setKonten('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      updateBerita({
        ...item,
        judul,
        kategori,
        rawTanggal,
        gambar: gambar.trim() || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        ringkasan,
        konten
      });
    } else {
      addBerita({
        judul,
        kategori,
        rawTanggal,
        tanggal: '',
        gambar: gambar.trim() || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
        ringkasan,
        konten
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-emerald-950 mb-5">
          {item ? '✏️ Edit Berita' : '📰 Tambah Berita Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Berita *</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              >
                <option value="Sosial">Sosial</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Pemberdayaan">Pemberdayaan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={rawTanggal}
                onChange={(e) => setRawTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar / Foto</label>
            <input
              type="url"
              value={gambar}
              onChange={(e) => setGambar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Singkat *</label>
            <textarea
              rows={2}
              required
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Konten Berita Lengkap *</label>
            <textarea
              rows={6}
              required
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Berita</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   2. PROGRAM FORM MODAL (Add / Edit)
   ========================================================================= */
interface ProgramModalProps {
  isOpen: boolean;
  item: ProgramItem | null;
  onClose: () => void;
}

export const ProgramFormModal: React.FC<ProgramModalProps> = ({ isOpen, item, onClose }) => {
  const { addProgram, updateProgram } = useFoundation();
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [target, setTarget] = useState('');
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    if (item) {
      setNama(item.nama || '');
      setDeskripsi(item.deskripsi || '');
      setTarget(item.target || '');
      setProgress(item.progress || 0);
    } else {
      setNama('');
      setDeskripsi('');
      setTarget('100 Anak Yatim');
      setProgress(50);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      updateProgram({
        ...item,
        nama,
        deskripsi,
        target,
        progress: Number(progress)
      });
    } else {
      addProgram({
        nama,
        deskripsi,
        target,
        progress: Number(progress)
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-emerald-950 mb-5">
          {item ? '✏️ Edit Program Kerja' : '🎯 Buat Program Kerja Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Program *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Beasiswa Santri & Yatim Mandiri"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat Program *</label>
            <textarea
              rows={3}
              required
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan tujuan dan penerima manfaat program..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Capaian *</label>
            <input
              type="text"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Contoh: 100 Anak Yatim atau 500 Paket"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Progres Penyaluran</label>
              <span className="text-sm font-extrabold text-emerald-800">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-emerald-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Program</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   3. GALERI FORM MODAL (Add Photo)
   ========================================================================= */
interface GaleriModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GaleriFormModal: React.FC<GaleriModalProps> = ({ isOpen, onClose }) => {
  const { addGaleri } = useFoundation();
  const [judul, setJudul] = useState('');
  const [gambar, setGambar] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gambar.trim()) return;
    addGaleri({
      judul: judul.trim() || 'Dokumentasi Yayasan Bina Asri',
      gambar: gambar.trim()
    });
    setJudul('');
    setGambar('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-emerald-950 mb-5">
          🖼️ Tambah Foto ke Galeri
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Keterangan Foto *</label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Penyaluran Paket Sembako Ramadhan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Link Foto / Gambar *</label>
            <input
              type="url"
              required
              value={gambar}
              onChange={(e) => setGambar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan ke Galeri</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   4. PENGURUS FORM MODAL (Add / Edit)
   ========================================================================= */
interface PengurusModalProps {
  isOpen: boolean;
  item: PengurusItem | null;
  defaultCabang?: string;
  onClose: () => void;
}

export const PengurusFormModal: React.FC<PengurusModalProps> = ({ isOpen, item, defaultCabang, onClose }) => {
  const { addPengurus, updatePengurus } = useFoundation();
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [cabang, setCabang] = useState('Pusat / Wilayah Kalbar');
  const [kontak, setKontak] = useState('');
  const [foto, setFoto] = useState('');

  useEffect(() => {
    if (item) {
      setNama(item.nama || '');
      setJabatan(item.jabatan || '');
      setCabang(item.cabang || 'Pusat / Wilayah Kalbar');
      setKontak(item.kontak || '');
      setFoto(item.foto || '');
    } else {
      setNama('');
      setJabatan('');
      setCabang(defaultCabang || 'Kota Pontianak');
      setKontak('');
      setFoto('');
    }
  }, [item, defaultCabang, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200';
    if (item) {
      updatePengurus({
        ...item,
        nama,
        jabatan,
        cabang,
        kontak: kontak.trim() || undefined,
        foto: foto.trim() || fallbackPhoto
      });
    } else {
      addPengurus({
        nama,
        jabatan,
        cabang,
        kontak: kontak.trim() || undefined,
        foto: foto.trim() || fallbackPhoto
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-emerald-950 mb-5">
          {item ? '✏️ Edit Data Pengurus' : '👥 Tambah Pengurus Yayasan'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Bapak H. Ahmad Fauzi, S.Pd."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan *</label>
              <input
                type="text"
                required
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Contoh: Ketua Cabang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cabang Daerah *</label>
              <select
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none font-medium"
              >
                <option value="Pusat / Wilayah Kalbar">Pusat / Wilayah Kalbar</option>
                <option value="Kota Pontianak">Kota Pontianak</option>
                <option value="Kabupaten Kubu Raya">Kabupaten Kubu Raya</option>
                <option value="Kabupaten Mempawah">Kabupaten Mempawah</option>
                <option value="Kabupaten Sanggau">Kabupaten Sanggau</option>
                <option value="Kabupaten Sintang">Kabupaten Sintang</option>
                <option value="Kabupaten Ketapang">Kabupaten Ketapang</option>
                <option value="Kota Singkawang">Kota Singkawang</option>
                <option value="Kabupaten Sambas">Kabupaten Sambas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kontak / HP (Opsional)</label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="0813-xxxx-xxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto (Opsional)</label>
              <input
                type="url"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengurus</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   5. BANK FORM MODAL (Add / Edit)
   ========================================================================= */
interface BankModalProps {
  isOpen: boolean;
  item: BankAccount | null;
  onClose: () => void;
}

export const BankFormModal: React.FC<BankModalProps> = ({ isOpen, item, onClose }) => {
  const { addBank, updateBank } = useFoundation();
  const [bank, setBank] = useState('');
  const [badge, setBadge] = useState('Daerah');
  const [norek, setNorek] = useState('');
  const [an, setAn] = useState('a.n. YAYASAN BINA ASRI');

  useEffect(() => {
    if (item) {
      setBank(item.bank || '');
      setBadge(item.badge || 'Daerah');
      setNorek(item.norek || '');
      setAn(item.an || 'a.n. YAYASAN BINA ASRI');
    } else {
      setBank('');
      setBadge('Daerah');
      setNorek('');
      setAn('a.n. YAYASAN BINA ASRI');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      updateBank({
        ...item,
        bank: bank.trim(),
        badge,
        norek: norek.trim(),
        an: an.trim()
      });
    } else {
      addBank({
        bank: bank.trim(),
        badge,
        norek: norek.trim(),
        an: an.trim()
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-xl font-black text-emerald-950 mb-5">
          {item ? '✏️ Edit Rekening Bank' : '💳 Tambah Rekening Bank'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank *</label>
            <input
              type="text"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Contoh: BANK KALBAR, BRI, MANDIRI, BSI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none uppercase font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori / Badge</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
              >
                <option value="Daerah">Daerah</option>
                <option value="Nasional">Nasional</option>
                <option value="Syariah">Syariah</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">No. Rekening *</label>
              <input
                type="text"
                required
                value={norek}
                onChange={(e) => setNorek(e.target.value)}
                placeholder="1025-00-123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama Rekening *</label>
            <input
              type="text"
              required
              value={an}
              onChange={(e) => setAn(e.target.value)}
              placeholder="a.n. YAYASAN BINA ASRI"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Rekening Bank</span>
          </button>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   6. QUICK SECTION EDIT MODAL (Hero, Profil, Stats, Donasi, Kontak, Footer)
   ========================================================================= */
interface QuickEditModalProps {
  type: 'hero' | 'profil' | 'stats' | 'donasi' | 'kontak' | 'footer' | 'sectionHeader' | null;
  sectionPrefix?: 'program' | 'berita' | 'galeri' | 'pengurus';
  onClose: () => void;
}

export const QuickEditSectionModal: React.FC<QuickEditModalProps> = ({ type, sectionPrefix, onClose }) => {
  const { kontenWeb, saveFullKonten } = useFoundation();
  const [formState, setFormState] = useState<Partial<KontenWeb>>({});

  useEffect(() => {
    setFormState({ ...kontenWeb });
  }, [kontenWeb, type]);

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFullKonten(formState);
    onClose();
  };

  const update = (key: keyof KontenWeb, val: string) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* HERO */}
          {type === 'hero' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit Beranda & Hero Banner</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  value={formState.hero_badge || ''}
                  onChange={(e) => update('hero_badge', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Utama Hero (H1)</label>
                <input
                  type="text"
                  value={formState.hero_title || ''}
                  onChange={(e) => update('hero_title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Hero</label>
                <textarea
                  rows={3}
                  value={formState.hero_desc || ''}
                  onChange={(e) => update('hero_desc', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Logo Tengah (Bulat)</label>
                <input
                  type="url"
                  value={formState.logo_bulat || ''}
                  onChange={(e) => update('logo_bulat', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tombol 1 (Donasi)</label>
                  <input
                    type="text"
                    value={formState.hero_cta_donasi || ''}
                    onChange={(e) => update('hero_cta_donasi', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tombol 2 (Program)</label>
                  <input
                    type="text"
                    value={formState.hero_cta_program || ''}
                    onChange={(e) => update('hero_cta_program', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tombol 3 (Kontak)</label>
                  <input
                    type="text"
                    value={formState.hero_cta_kontak || ''}
                    onChange={(e) => update('hero_cta_kontak', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* STATS */}
          {type === 'stats' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit 4 Angka Statistik</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 1: Angka</label>
                  <input
                    type="text"
                    value={formState.stat_1_num || ''}
                    onChange={(e) => update('stat_1_num', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 1: Label</label>
                  <input
                    type="text"
                    value={formState.stat_1_label || ''}
                    onChange={(e) => update('stat_1_label', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 2: Angka</label>
                  <input
                    type="text"
                    value={formState.stat_2_num || ''}
                    onChange={(e) => update('stat_2_num', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 2: Label</label>
                  <input
                    type="text"
                    value={formState.stat_2_label || ''}
                    onChange={(e) => update('stat_2_label', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 3: Angka</label>
                  <input
                    type="text"
                    value={formState.stat_3_num || ''}
                    onChange={(e) => update('stat_3_num', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 3: Label</label>
                  <input
                    type="text"
                    value={formState.stat_3_label || ''}
                    onChange={(e) => update('stat_3_label', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 4: Angka</label>
                  <input
                    type="text"
                    value={formState.stat_4_num || ''}
                    onChange={(e) => update('stat_4_num', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stat 4: Label</label>
                  <input
                    type="text"
                    value={formState.stat_4_label || ''}
                    onChange={(e) => update('stat_4_label', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* PROFIL */}
          {type === 'profil' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit Profil & Visi Misi</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formState.profil_tag || ''}
                  onChange={(e) => update('profil_tag', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Profil</label>
                <input
                  type="text"
                  value={formState.profil_title || ''}
                  onChange={(e) => update('profil_title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto Kegiatan</label>
                  <input
                    type="url"
                    value={formState.profil_img || ''}
                    onChange={(e) => update('profil_img', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Legalitas Kemenkumham</label>
                  <input
                    type="text"
                    value={formState.profil_legal || ''}
                    onChange={(e) => update('profil_legal', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 1</label>
                <textarea
                  rows={3}
                  value={formState.profil_p1 || ''}
                  onChange={(e) => update('profil_p1', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf 2</label>
                <textarea
                  rows={3}
                  value={formState.profil_p2 || ''}
                  onChange={(e) => update('profil_p2', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teks Visi Utama</label>
                <textarea
                  rows={2}
                  value={formState.visi_text || ''}
                  onChange={(e) => update('visi_text', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Butir Misi (Satu baris per poin)</label>
                <textarea
                  rows={3}
                  value={formState.misi_items || ''}
                  onChange={(e) => update('misi_items', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
            </>
          )}

          {/* DONASI */}
          {type === 'donasi' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit Teks Halaman Donasi</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Ajakan Donasi</label>
                <input
                  type="text"
                  value={formState.donasi_title || ''}
                  onChange={(e) => update('donasi_title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Donasi</label>
                <textarea
                  rows={3}
                  value={formState.donasi_desc || ''}
                  onChange={(e) => update('donasi_desc', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Poin Keunggulan (Satu baris per poin)</label>
                <textarea
                  rows={4}
                  value={formState.donasi_points || ''}
                  onChange={(e) => update('donasi_points', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
            </>
          )}

          {/* KONTAK */}
          {type === 'kontak' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit Kontak & Narahubung</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Kantor</label>
                <textarea
                  rows={2}
                  value={formState.kontak_alamat || ''}
                  onChange={(e) => update('kontak_alamat', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telepon Teks Tampilan</label>
                  <input
                    type="text"
                    value={formState.kontak_telepon || ''}
                    onChange={(e) => update('kontak_telepon', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp Link (Hanya angka)</label>
                  <input
                    type="text"
                    value={formState.wa_number || ''}
                    onChange={(e) => update('wa_number', e.target.value)}
                    placeholder="6281256789012"
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="text"
                    value={formState.kontak_email || ''}
                    onChange={(e) => update('kontak_email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={formState.kontak_jam || ''}
                    onChange={(e) => update('kontak_jam', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* FOOTER */}
          {type === 'footer' && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">✏️ Edit Footer & Legalitas</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat Footer</label>
                <textarea
                  rows={3}
                  value={formState.footer_desc || ''}
                  onChange={(e) => update('footer_desc', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Legalitas & NPWP</label>
                <textarea
                  rows={3}
                  value={formState.footer_legal || ''}
                  onChange={(e) => update('footer_legal', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hak Cipta (Copyright)</label>
                <input
                  type="text"
                  value={formState.footer_copyright || ''}
                  onChange={(e) => update('footer_copyright', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
            </>
          )}

          {/* SECTION HEADER (Program / Berita / Galeri / Pengurus) */}
          {type === 'sectionHeader' && sectionPrefix && (
            <>
              <h3 className="text-xl font-black text-emerald-950 mb-4">
                ✏️ Edit Judul Bagian {sectionPrefix.toUpperCase()}
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline / Badge Kategori</label>
                <input
                  type="text"
                  value={(formState[`${sectionPrefix}_tag` as keyof KontenWeb] as string) || ''}
                  onChange={(e) => update(`${sectionPrefix}_tag` as keyof KontenWeb, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Section</label>
                <input
                  type="text"
                  value={(formState[`${sectionPrefix}_title` as keyof KontenWeb] as string) || ''}
                  onChange={(e) => update(`${sectionPrefix}_title` as keyof KontenWeb, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Section</label>
                <textarea
                  rows={3}
                  value={(formState[`${sectionPrefix}_desc` as keyof KontenWeb] as string) || ''}
                  onChange={(e) => update(`${sectionPrefix}_desc` as keyof KontenWeb, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </form>
      </div>
    </div>
  );
};
