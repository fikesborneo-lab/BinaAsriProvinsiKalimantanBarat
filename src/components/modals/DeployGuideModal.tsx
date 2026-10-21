import React, { useState } from 'react';
import { X, Github, Globe, Database, Copy, Check, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitSnippet1 = `git init
git add .
git commit -m "feat: Website Yayasan Bina Asri Kalimantan Barat"`;

  const gitSnippet2 = `git branch -M main
git remote add origin https://github.com/USERNAME/yayasan-bina-asri-kalbar.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden relative text-slate-800">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 text-emerald-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">Panduan Ekspor ke GitHub & Deploy ke Vercel</h3>
              <p className="text-xs text-slate-400">
                Langkah menyimpan kode ke GitHub pribadi dan hosting gratis di Vercel / Supabase
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Step 1: GitHub */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Simpan Kode ke GitHub Pribadi</span>
            </div>
            <p className="text-slate-600 text-xs">
              Buat repository baru di{' '}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-bold inline-flex items-center gap-1 hover:underline"
              >
                github.com/new <ExternalLink className="w-3 h-3" />
              </a>{' '}
              dengan nama misal <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">yayasan-bina-asri-kalbar</code>, lalu jalankan perintah terminal:
            </p>

            <div className="relative bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{gitSnippet1}</pre>
              <button
                onClick={() => copyToClipboard(gitSnippet1, 1)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-sans flex items-center gap-1"
              >
                {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === 1 ? 'Tersalin' : 'Salin'}
              </button>
            </div>

            <p className="text-slate-600 text-xs">Kemudian hubungkan dan push ke repo Anda:</p>

            <div className="relative bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
              <pre>{gitSnippet2}</pre>
              <button
                onClick={() => copyToClipboard(gitSnippet2, 2)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-sans flex items-center gap-1"
              >
                {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedIndex === 2 ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>

          {/* Step 2: Database Connection */}
          <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-sm sm:text-base">
              <Database className="w-5 h-5 text-emerald-700" />
              <span>Database Supabase / Cloud SQL (Free & Persistent)</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              Website ini sudah dikonfigurasi menggunakan PostgreSQL. Jika menggunakan <strong>Supabase</strong> (gratis):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-xs pl-2">
              <li>Buat project baru di <strong>supabase.com</strong>.</li>
              <li>Buka menu <strong>Project Settings &gt; Database &gt; Connection String (URI)</strong>.</li>
              <li>Salin URI connection string tersebut untuk dimasukkan ke Environment Variables Vercel.</li>
            </ol>
          </div>

          {/* Step 3: Vercel Deploy */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Deploy ke Vercel</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-xs pl-2">
              <li>Buka <strong>vercel.com</strong> dan login dengan akun GitHub Anda.</li>
              <li>Klik <strong>Add New Project</strong> &gt; pilih repositori <strong>yayasan-bina-asri-kalbar</strong>.</li>
              <li>
                Pada bagian <strong>Environment Variables</strong>, tambahkan:
                <div className="mt-2 space-y-1 font-mono text-[11px]">
                  <div className="p-2 bg-white rounded-lg border flex justify-between">
                    <span className="text-slate-600">DATABASE_URL</span>
                    <span className="text-emerald-700 font-bold">URI PostgreSQL dari Supabase / Cloud SQL</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border flex justify-between">
                    <span className="text-slate-600">NODE_ENV</span>
                    <span className="text-emerald-700 font-bold">production</span>
                  </div>
                </div>
              </li>
              <li className="mt-2">Klik tombol <strong>Deploy</strong>. Website Anda akan aktif dalam 1-2 menit!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
          <span className="text-xs text-slate-500">File panduan lengkap tersedia di <code>PANDUAN_GITHUB_VERCEL.md</code></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
