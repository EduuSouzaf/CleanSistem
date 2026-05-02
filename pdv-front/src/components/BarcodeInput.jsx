import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine, Camera } from 'lucide-react';
import CameraScanner from './CameraScanner';

export default function BarcodeInput({ onSubmit, cartLength }) {
  const [value, setValue] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef(null);

  const refocus = useCallback(() => {
    if (!cameraOpen) inputRef.current?.focus();
  }, [cameraOpen]);

  useEffect(() => {
    refocus();
    document.addEventListener('mousedown', refocus);
    return () => document.removeEventListener('mousedown', refocus);
  }, [refocus]);

  useEffect(() => {
    refocus();
  }, [cartLength, refocus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleCameraDetect = (barcode) => {
    onSubmit(barcode);
  };

  return (
    <>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <ScanLine
            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
            size={20}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Código de barras + Enter"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full pl-12 pr-4 py-4 text-base font-medium rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white transition-colors placeholder:text-slate-400"
          />
        </div>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setCameraOpen(true)}
          className="shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl flex items-center justify-center transition-all"
          title="Escanear com câmera"
        >
          <Camera size={20} />
        </button>
      </div>

      {cameraOpen && (
        <CameraScanner
          onDetected={handleCameraDetect}
          onClose={() => {
            setCameraOpen(false);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        />
      )}
    </>
  );
}
