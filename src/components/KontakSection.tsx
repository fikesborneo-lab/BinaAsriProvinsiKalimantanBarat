import React, { useState } from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { MapPin, Phone, Mail, Clock, Send, Edit2 } from 'lucide-react';

interface KontakSectionProps {
  onOpenEditKontak: () => void;
}

export const KontakSection: React.FC<KontakSectionProps> = ({ onOpenEditKontak }) => {
  const { adminSession, submitPesan } = useFoundation();

  const [formData, setFormData] = useState({
    nama: '',
    telepon: '',
    email: '',
    subjek: 'Informasi Donasi',
    pesan: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      submitPesan(formData);
      setFormData({
        nama: '',
        telepon: '',
        email: '',
        subjek: 'Informasi Donasi',
        pesan: ''
      });
      setSubmitting(false);
    }, 600);
  };

  return (
    <section id="kontak" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <EditableText
                  contentKey="kontak_title"
                  as="h3"
                  className="text-2xl font-black text-white tracking-tight"
                />
                {adminSession && (
                  <button
                    onClick={onOpenEditKontak}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Kontak</span>
                  </button>
                )}
              </div>

              <EditableText
                contentKey="kontak_desc"
                as="p"
                multiline
                className="text-emerald-100 text-sm leading-relaxed mb-8 opacity-90"
              />

              {/* Items */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold uppercase tracking-wider text-emerald-300 text-[10px] mb-1">
                      Alamat Kantor
                    </h5>
                    <EditableText
                      contentKey="kontak_alamat"
                      as="p"
                      multiline
                      className="font-semibold text-white leading-relaxed text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold uppercase tracking-wider text-emerald-300 text-[10px] mb-1">
                      Telepon / WhatsApp
                    </h5>
                    <EditableText
                      contentKey="kontak_telepon"
                      as="p"
                      className="font-semibold text-white leading-relaxed text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold uppercase tracking-wider text-emerald-300 text-[10px] mb-1">
                      Email Resmi
                    </h5>
                    <EditableText
                      contentKey="kontak_email"
                      as="p"
                      className="font-semibold text-white leading-relaxed text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold uppercase tracking-wider text-emerald-300 text-[10px] mb-1">
                      Jam Layanan
                    </h5>
                    <EditableText
                      contentKey="kontak_jam"
                      as="p"
                      className="font-semibold text-white leading-relaxed text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-emerald-200">
              Yayasan Bina Asri • Melayani masyarakat dan dhuafa di Kalimantan Barat dengan hati dan amanah.
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 p-8 sm:p-12">
            <h3 className="text-2xl font-extrabold text-emerald-950 mb-2">
              Kirim Pesan / Permohonan
            </h3>
            <p className="text-slate-500 text-sm mb-8">
              Silakan isi formulir di bawah ini. Tim yayasan kami akan merespons pesan Anda secepatnya.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    No. WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: budi@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Perihal / Kebutuhan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.subjek}
                    onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all"
                  >
                    <option value="Konsultasi & Skrining TBC">Konsultasi & Skrining Gejala TBC</option>
                    <option value="Pendampingan Pasien TBC">Pendampingan Pasien TBC / PMO</option>
                    <option value="Informasi Donasi">Informasi / Konfirmasi Donasi</option>
                    <option value="Kemitraan Faskes / DPPM">Kemitraan Fasilitas Kesehatan / DPPM</option>
                    <option value="Kerjasama CSR / Lembaga">Kerjasama Sosial / Kemitraan CSR</option>
                    <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Isi Pesan / Keterangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.pesan}
                  onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                  placeholder="Tuliskan pesan, saran, atau permohonan Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none transition-all resize-y"
                ></textarea>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-800/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span>⏳ Sedang mengirimkan pesan...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirimkan Pesan Sekarang</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/6282152191199?text=${encodeURIComponent(
                    `Assalamu'alaikum Yayasan Bina Asri, saya ${formData.nama || 'Pengunjung'}${
                      formData.subjek ? ` [Perihal: ${formData.subjek}]` : ''
                    }: ${formData.pesan || 'ingin berkonsultasi mengenai program yayasan.'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors text-center"
                >
                  <span>💬 Atau Hubungi Langsung via WhatsApp Resmi</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
