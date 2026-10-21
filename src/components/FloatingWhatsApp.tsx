import React from 'react';
import { useFoundation } from '../context/FoundationContext';
import { MessageSquareText } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { kontenWeb } = useFoundation();
  const rawNumber = (kontenWeb.wa_number || '6281256789012').replace(/[^0-9]/g, '');
  const greeting = encodeURIComponent(
    "Assalamu'alaikum Yayasan Bina Asri Kalimantan Barat, saya ingin berkonsultasi mengenai program dan donasi."
  );
  const waUrl = `https://wa.me/${rawNumber}?text=${greeting}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
      title="Hubungi Yayasan via WhatsApp"
    >
      <MessageSquareText className="w-7 h-7" />
      <span className="sr-only">Chat WhatsApp Yayasan Bina Asri</span>

      {/* Floating tooltip on hover */}
      <div className="absolute left-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Chat WhatsApp Yayasan
      </div>
    </a>
  );
};
