import React, { useState } from 'react';
import { X, Activity, CheckCircle2, AlertTriangle, ArrowRight, Phone, MapPin, RefreshCw } from 'lucide-react';
import { useFoundation } from '../../context/FoundationContext';

interface TbcScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: string;
  text: string;
  desc: string;
  isMain: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'batuk2minggu',
    text: 'Batuk terus menerus selama 2 minggu atau lebih?',
    desc: 'Batuk berdahak atau batuk kering yang tidak kunjung reda lebih dari 14 hari.',
    isMain: true,
  },
  {
    id: 'batukdarah',
    text: 'Batuk mengeluarkan dahak bercampur bercak darah?',
    desc: 'Dahak berwarna kemerahan atau kecoklatan saat batuk.',
    isMain: true,
  },
  {
    id: 'demam',
    text: 'Mengalami demam meriang berulang atau lebih dari sebulan?',
    desc: 'Suhu tubuh naik turun terutama menjelang sore atau malam hari.',
    isMain: false,
  },
  {
    id: 'keringatmalam',
    text: 'Keringat dingin di malam hari tanpa aktivitas fisik?',
    desc: 'Bangun tidur dengan pakaian basah oleh keringat meski cuaca dingin atau ber-AC.',
    isMain: false,
  },
  {
    id: 'beratbadan',
    text: 'Penurunan berat badan tanpa diet atau nafsu makan menurun drastis?',
    desc: 'Tubuh terasa semakin kurus dan lemas dalam 1–2 bulan terakhir.',
    isMain: false,
  },
  {
    id: 'kontakserumah',
    text: 'Pernah tinggal serumah atau kontak erat dengan pasien TBC?',
    desc: 'Keluarga, rekan kerja, atau teman sekamar yang sedang atau pernah menjalani pengobatan TBC.',
    isMain: false,
  },
];

export const TbcScreeningModal: React.FC<TbcScreeningModalProps> = ({ isOpen, onClose }) => {
  const { kontenWeb } = useFoundation();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (id: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  // Evaluation
  const yesCount = Object.values(answers).filter(Boolean).length;
  const hasMainSymptom = answers['batuk2minggu'] || answers['batukdarah'];
  const hasContact = answers['kontakserumah'];
  const isHighRisk = hasMainSymptom || yesCount >= 2;

  const waNumber = (kontenWeb.wa_number || '6282152191199').replace(/[^0-9]/g, '');
  const waConsultMessage = encodeURIComponent(
    `Assalamu'alaikum Yayasan Bina Asri, saya telah melakukan Skrining Mandiri TBC dengan hasil ${
      isHighRisk ? 'Terduga Berisiko TBC' : 'Gejala Ringan'
    }. Mohon petunjuk faskes puskesmas terdekat atau pendampingan kader.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waConsultMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-amber-300 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">Skrining Gejala TBC Mandiri</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  TOSS TBC
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Temukan TBC, Obati Sampai Sembuh   Standar Kementerian Kesehatan & Global Fund
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {!submitted ? (
            <>
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 text-emerald-950 leading-relaxed text-xs">
                <strong>Penting:</strong> Tuberkulosis (TBC) dapat disembuhkan jika dideteksi sejak dini dan diobati secara tuntas. Jawablah 6 pertanyaan skrining mandiri berikut dengan jujur:
              </div>

              {/* Questions list */}
              <div className="space-y-3">
                {QUESTIONS.map((q, idx) => {
                  const currentVal = answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        currentVal === true
                          ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                          : currentVal === false
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {q.text}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {q.desc}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Yes / No buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggle(q.id, true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentVal === true
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(q.id, false)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentVal === false
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            Tidak
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <span>Lihat Hasil Skrining & Rekomendasi Medis</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="space-y-5 animate-in fade-in duration-300">
              {isHighRisk ? (
                /* High risk / Suspicious */
                <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                        Hasil Evaluasi:
                      </span>
                      <h4 className="text-xl font-black text-slate-900 leading-tight">
                        Terindikasi Gejala Terduga TBC (Suspek)
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Berdasarkan jawaban Anda, terdapat gejala yang mengarah pada indikasi Tuberkulosis (TBC). <strong>Jangan panik</strong>, obat TBC disediakan <strong>GRATIS</strong> oleh pemerintah melalui Puskesmas dan Rumah Sakit rujukan.
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-900">Langkah yang Disarankan Segera:</h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      <li>Periksakan dahak / tes TCM (Tes Cepat Molekuler) ke Puskesmas terdekat di wilayah Anda.</li>
                      <li>Gunakan masker untuk melindungi anggota keluarga serumah dari percikan batuk/bersin.</li>
                      <li>Hubungi kader Yayasan Bina Asri untuk mendapatkan pendampingan ke fasilitas kesehatan tanpa dipungut biaya.</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all text-center"
                    >
                      <Phone className="w-4 h-4 text-amber-300" />
                      <span>Hubungi Hotline Yayasan Bina Asri</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ulangi Skrining</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Low risk */
                <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                        Hasil Evaluasi:
                      </span>
                      <h4 className="text-xl font-black text-slate-900 leading-tight">
                        Risiko Rendah / Tidak Ada Gejala Khas TBC
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Alhamdulillah, dari jawaban yang diberikan saat ini Anda belum menunjukkan gejala khas TBC. Tetap jaga imunitas tubuh dan terapkan Perilaku Hidup Bersih dan Sehat (PHBS).
                  </p>

                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-900">Tips Pencegahan TBC:</h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      <li>Pastikan sirkulasi udara dan sinar matahari masuk ke dalam rumah.</li>
                      <li>Konsumsi makanan bergizi seimbang dan istirahat yang cukup.</li>
                      <li>Terapkan etika batuk (tutup mulut dengan lengan dalam atau tisu).</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ulangi Skrining</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
