import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function PwaInstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 animate-fade-in">
      <div className="bg-indigo-600 rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone size={20} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Instalar o PDV</p>
          <p className="text-indigo-200 text-xs mt-0.5">Acesse como app no celular ou desktop</p>
        </div>

        <button
          onClick={install}
          className="shrink-0 bg-white text-indigo-600 font-bold text-sm px-3.5 py-2 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Download size={15} />
          Instalar
        </button>

        <button
          onClick={dismiss}
          className="shrink-0 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}
