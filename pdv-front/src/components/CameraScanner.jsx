import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const REGION_ID = 'html5qrcode-region';

export default function CameraScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const closingRef = useRef(false);
  // Keep callbacks in a ref so the effect never needs to re-run when they change
  const cbRef = useRef({ onDetected, onClose });
  cbRef.current = { onDetected, onClose };

  const [starting, setStarting] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  // Single exit point: stop scanner → then fire callbacks
  const stopAndClose = useCallback(async (detectedCode = null) => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      await scannerRef.current?.stop();
    } catch {
      // already stopped or never started — ignore
    }
    if (detectedCode !== null) cbRef.current.onDetected(detectedCode);
    cbRef.current.onClose();
  }, []);

  useEffect(() => {
    // Fecha teclado antes de mostrar a câmera
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (decodedText) => stopAndClose(decodedText),
        () => {}
      )
      .then(() => setStarting(false))
      .catch(() => {
        setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
        setStarting(false);
      });

    return () => {
      // Only runs if component unmounts WITHOUT going through stopAndClose
      // (e.g. parent navigates away while scanner is open)
      if (!closingRef.current) {
        closingRef.current = true;
        scanner.stop().catch(() => {});
      }
    };
  }, [stopAndClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-blue-600" />
            <span className="font-bold text-slate-900 text-sm">Escanear código</span>
          </div>
          <button
            onClick={() => stopAndClose(null)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        <div className="relative bg-black min-h-[200px]">
          {starting && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-white text-sm">Iniciando câmera...</p>
            </div>
          )}
          <div id={REGION_ID} className="w-full" />
        </div>

        {cameraError ? (
          <div className="px-5 py-4 bg-red-50">
            <p className="text-sm text-red-600 font-medium text-center">{cameraError}</p>
          </div>
        ) : (
          <div className="px-5 py-3 bg-slate-50">
            <p className="text-xs text-slate-400 text-center">
              Aponte a câmera para o código de barras
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
