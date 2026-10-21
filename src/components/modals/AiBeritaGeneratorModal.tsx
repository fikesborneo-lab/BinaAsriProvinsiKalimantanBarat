import React, { useState } from 'react';
import { useFoundation } from '../../context/FoundationContext';
import { Sparkles, X, Loader2, CheckCircle2, RefreshCw, Send, ArrowRight, Wand2 } from 'lucide-react';
import { BeritaItem } from '../../types';

interface AiBeritaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToForm: (item: Partial<BeritaItem>) => void;
}

export const AiBeritaGeneratorModal: React.FC<AiBeritaGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyToForm,
}) => {
  const { addBerita, showToast } = useFoundation();

  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Sosial');
  const [cabang, setCabang] = useState('Provinsi Kalimantan Barat');
  const [tone, setTone] = useState('Inspiratif & Resmi');
  const [loading, setLoading] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<{
    judul: string;
    kategori: string;
    ringkasan: string;
    konten: string;
    gambar: string;
    rawTanggal: string;
    tanggal: string;
    tags?: string[];
  } | null>(null);

  if (!isOpen) return null;

  const quickTopics = [
    'Penyaluran Santunan Yatim & Beasiswa Tahfidz',
    'Pemberdayaan Ekonomi UMKM Dhuafa',
    'Bantuan Pangan & Paket Sembako Berkah',
    'Safari Dakwah & Bimbingan Al-Qur\'an',
    'Layanan Cek Kesehatan Gratis Masyarakat',
    'Pelatihan Keterampilan Mandiri Remaja'
  ];

  const cabangOptions = [
    'Provinsi Kalimantan Barat (Pusat)',
    'Kota Pontianak',
    'Kabupaten Kubu Raya',
    'Kabupaten Mempawah',
    'Kabupaten Sanggau',
    'Kabupaten Sintang',
    'Kabupaten Ketapang',
    'Kota Singkawang',
    'Kabupaten Sambas'
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Silakan masukkan topik atau tema berita kegiatan.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
          cabang,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        setGeneratedArticle(data.article);
        showToast('Naskah berita berhasil dibuat oleh AI!', 'success');
      } else {
        showToast(data.error || 'Gagal membuat naskah berita.', 'error');
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      showToast('Terjadi gangguan saat memproses AI berita.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPublish = async () => {
    if (!generatedArticle) return;
    try {
      await addBerita({
        judul: generatedArticle.judul,
        kategori: generatedArticle.kategori,
        rawTanggal: generatedArticle.rawTanggal,
        tanggal: generatedArticle.tanggal,
        gambar: generatedArticle.gambar,
        ringkasan: generatedArticle.ringkasan,
        konten: generatedArticle.konten,
      });
      showToast('Berita berhasil dipublikasikan langsung ke website!', 'success');
      onClose();
    } catch (err) {
      showToast('Gagal mempublikasikan berita.', 'error');
    }
  };

  const handleOpenInEditor = () => {
    if (!generatedArticle) return;
    onApplyToForm(generatedArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20 text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">AI Asisten Penulis Berita</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-400/30">
                  Gratis / Free Tier
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Tulis naskah berita kegiatan Yayasan Bina Asri secara otomatis, islami, dan terstruktur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Form Parameters */}
          <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Topik / Kegiatan Berita *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Misal: Penyaluran santunan 50 anak yatim dan sembako dhuafa di Sambas..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white font-medium shadow-inner"
              />

              {/* Quick Topic Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 mr-1">Rekomendasi Cepat:</span>
                {quickTopics.map((qt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(qt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 text-slate-600 transition-all font-medium"
                  >
                    + {qt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600"
                >
                  <option value="Sosial">Sosial</option>
                  <option value="Pendidikan">Pendidikan</option>
                  <option value="Pemberdayaan">Pemberdayaan</option>
                  <option value="Kesehatan">Kesehatan</option>
                  <option value="Dakwah">Dakwah</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Cabang</label>
                <select
                  value={cabang}
                  onChange={(e) => setCabang(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600"
                >
                  {cabangOptions.map((cb, idx) => (
                    <option key={idx} value={cb}>
                      {cb}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gaya Bahasa</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white outline-none focus:border-emerald-600"
                >
                  <option value="Inspiratif & Resmi">Inspiratif & Khidmat</option>
                  <option value="Formal Jurnalistik">Laporan Jurnalistik</option>
                  <option value="Hangat & Menyentuh">Hangat & Mengharukan</option>
                  <option value="Dakwah & Edukasi">Dakwah & Syiar</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Sedang Menyusun Naskah Berita...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Buat Naskah Berita Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview */}
          {generatedArticle && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                    Hasil Naskah AI Siap Publikasi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    {generatedArticle.kategori}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                    {generatedArticle.tanggal}
                  </span>
                </div>
              </div>

              {/* Title & Preview */}
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-snug mb-2">
                  {generatedArticle.judul}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 italic bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 mb-3">
                  "{generatedArticle.ringkasan}"
                </p>
              </div>

              {/* Thumbnail preview */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border">
                <img
                  src={generatedArticle.gambar}
                  alt={generatedArticle.judul}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                  Foto Ilustrasi Berita
                </span>
              </div>

              {/* Article Content */}
              <div className="max-h-52 overflow-y-auto pr-2 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border whitespace-pre-line">
                {generatedArticle.konten}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenInEditor}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                >
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span>Buka di Form Editor (Kustomisasi)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectPublish}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Langsung Terbitkan ke Website</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
