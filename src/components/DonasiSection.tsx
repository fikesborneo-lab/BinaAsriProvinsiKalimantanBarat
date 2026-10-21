import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { EditableText } from './EditableText';
import { BankAccount } from '../types';
import { Copy, Check, Plus, Edit2, Trash2 } from 'lucide-react';

interface DonasiSectionProps {
  onOpenAddBank: () => void;
  onOpenEditBank: (bank: BankAccount) => void;
  onOpenEditDonasi: () => void;
}

export const DonasiSection: React.FC<DonasiSectionProps> = ({
  onOpenAddBank,
  onOpenEditBank,
  onOpenEditDonasi
}) => {
  const { kontenWeb, banks, deleteBank, adminSession, showToast } = useFoundation();
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const donasiPoints = (kontenWeb.donasi_points || '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleCopy = (norek: string, bankName: string, id: number) => {
    const cleanNorek = norek.replace(/[^0-9-]/g, '');
    navigator.clipboard.writeText(cleanNorek).then(() => {
      setCopiedId(id);
      showToast(`No. Rekening ${bankName} (${cleanNorek}) berhasil disalin ke clipboard!`, 'success');
      setTimeout(() => setCopiedId(null), 3000);
    }).catch(() => {
      showToast(`Rekening: ${cleanNorek}`, 'info');
    });
  };

  return (
    <section
      id="donasi"
      className="py-20 text-white relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Info & Promises */}
          <div className="lg:col-span-5">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-extrabold tracking-wider uppercase border border-white/20">
                Penyaluran Zakat & Sedekah
              </span>

              {adminSession && (
                <button
                  onClick={onOpenEditDonasi}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Teks Donasi</span>
                </button>
              )}
            </div>

            <EditableText
              contentKey="donasi_title"
              as="h2"
              className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-sm"
            />

            <EditableText
              contentKey="donasi_desc"
              as="p"
              multiline
              className="text-emerald-100 text-sm sm:text-base leading-relaxed mb-8 opacity-95"
            />

            {/* Checklist */}
            <ul className="space-y-3.5 text-xs sm:text-sm font-semibold">
              {donasiPoints.length > 0 ? (
                donasiPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow">
                      ✓
                    </span>
                    <span className="leading-snug">{pt}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow">
                    ✓
                  </span>
                  <span>Laporan penyaluran transparan dan amanah</span>
                </li>
              )}
            </ul>
          </div>

          {/* Right: Bank Accounts Grid */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h4 className="text-lg font-extrabold text-white">Rekening Resmi Yayasan</h4>
                <p className="text-xs text-emerald-200">Seluruh donasi langsung atas nama resmi Yayasan Bina Asri</p>
              </div>

              {adminSession && (
                <button
                  onClick={onOpenAddBank}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banks.map((b) => (
                <div
                  key={b.id}
                  className="bg-white text-slate-900 rounded-2xl p-5 shadow-lg border border-slate-100 flex flex-col justify-between hover:shadow-2xl transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-emerald-900 text-base">{b.bank}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        {b.badge || 'Resmi'}
                      </span>
                    </div>

                    <div className="font-mono text-lg font-black text-slate-900 tracking-wider mb-1 select-all">
                      {b.norek}
                    </div>

                    <div className="text-xs font-medium text-slate-500 mb-4">
                      {b.an}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => handleCopy(b.norek, b.bank, b.id)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        copiedId === b.id
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900'
                      }`}
                    >
                      {copiedId === b.id ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-emerald-700" />
                          <span>Salin No. Rekening</span>
                        </>
                      )}
                    </button>

                    {/* Direct Admin Card Actions */}
                    {adminSession && (
                      <div className="flex gap-2 pt-3 mt-3 border-t border-dashed border-slate-200">
                        <button
                          onClick={() => onOpenEditBank(b)}
                          className="flex-1 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus rekening "${b.bank} - ${b.norek}"?`)) {
                              deleteBank(b.id);
                            }
                          }}
                          className="py-1 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
