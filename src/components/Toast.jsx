import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm max-w-xs w-full animate-slide-down ${
        isSuccess ? 'bg-green-600' : 'bg-red-500'
      }`}
      style={{ transform: 'translateX(-50%)' }}
    >
      {isSuccess
        ? <CheckCircle2 size={18} className="shrink-0" />
        : <XCircle size={18} className="shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
