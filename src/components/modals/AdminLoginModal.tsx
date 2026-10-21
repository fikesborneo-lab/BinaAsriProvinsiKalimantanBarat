import React, { useState } from 'react';
import { useFoundation } from '../../context/FoundationContext';
import { X, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { kontenWeb, loginAdmin, setActiveView } = useFoundation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(username, password);
      setLoading(false);
      if (res.success) {
        onClose();
        setActiveView('dashboard');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Gagal login.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <img
            src={kontenWeb.logo_bulat || 'https://lh3.googleusercontent.com/d/1t_el0P4aHM3gLG4RTDrupVAjYTIaMqMZ'}
            alt="Logo"
            className="w-16 h-16 mx-auto mb-3 object-contain drop-shadow"
          />
          <h3 className="text-xl font-black text-emerald-950">Login Sistem Admin</h3>
          <p className="text-xs text-slate-500 font-medium">
            Yayasan Bina Asri Kalimantan Barat
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <span>Memverifikasi...</span> : <span>Masuk ke Dashboard</span>}
          </button>
        </form>

        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-600 mb-0.5">Kredensial Default Pengurus:</p>
          <p>
            User: <code className="font-bold text-emerald-800">admin</code> | Sandi:{' '}
            <code className="font-bold text-emerald-800">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
