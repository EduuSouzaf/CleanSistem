import React, { useState, useRef } from 'react';
import { ScanLine, Camera, Search } from 'lucide-react';
import CameraScanner from './CameraScanner';

// Input controlado — sem dropdown, sem lógica de sugestões
// A lista de resultados é responsabilidade do pai (VendasPage)
export default function BarcodeInput({ value, onChange, onSubmit, onCameraDetect, isSearchMode }) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    }
    if (e.key === 'Escape') {
      onChange('');
    }
  };

  return (
    <>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          {isSearchMode ? (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={20} />
          ) : (
            <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={20} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Código de barras ou nome do produto"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full pl-12 pr-4 py-4 text-base font-medium rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white transition-colors placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl flex items-center justify-center transition-all"
          title="Escanear com câmera"
        >
          <Camera size={20} />
        </button>
      </div>

      {cameraOpen && (
        <CameraScanner
          onDetected={(barcode) => {
            onCameraDetect(barcode);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
}
