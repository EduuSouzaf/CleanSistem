import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import CameraScanner from './CameraScanner';

export default function CameraButton({ onDetected, size = 'md' }) {
  const [open, setOpen] = useState(false);

  const cls =
    size === 'sm'
      ? 'w-10 h-10 rounded-xl'
      : 'w-11 h-11 rounded-xl';

  return (
    <>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(true)}
        className={`shrink-0 ${cls} bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all`}
        title="Escanear com câmera"
      >
        <Camera size={18} />
      </button>

      {open && (
        <CameraScanner
          onDetected={onDetected}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
