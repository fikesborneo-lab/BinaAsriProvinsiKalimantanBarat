import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFoundation();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl text-sm font-medium border transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-100 border-rose-500/50'
              : toast.type === 'info'
              ? 'bg-slate-900/95 text-slate-100 border-slate-700'
              : 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs leading-relaxed">{toast.text}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
