import React, { useState, useRef } from 'react';
import { ScanLine, Camera, Search } from 'lucide-react';
import CameraScanner from './CameraScanner';
import { formatBRL } from '../utils/format';

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export default function BarcodeInput({ onSubmit, produtos = [], onAddById }) {
  const [value, setValue] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const blurTimer = useRef(null);

  const isSearchMode = value.trim().length >= 2 && !/^\d+$/.test(value.trim());
  const suggestions = isSearchMode
    ? produtos.filter((p) => normalize(p.nome).includes(normalize(value))).slice(0, 8)
    : [];

  const handleSelect = (produto) => {
    clearTimeout(blurTimer.current);
    onAddById?.(produto.id);
    setValue('');
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        onSubmit(value.trim());
        setValue('');
        setShowDropdown(false);
      }
    }
    if (e.key === 'Escape') {
      setValue('');
      setShowDropdown(false);
    }
  };

  return (
    <>
      <div className="relative flex gap-2">
        {/* Input */}
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
            onChange={(e) => { setValue(e.target.value); setShowDropdown(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (value.trim().length >= 2) setShowDropdown(true); }}
            onBlur={() => { blurTimer.current = setTimeout(() => setShowDropdown(false), 200); }}
            placeholder="Código de barras ou nome do produto"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full pl-12 pr-4 py-4 text-base font-medium rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white transition-colors placeholder:text-slate-400"
          />

          {/* Dropdown — posicionado absolutamente abaixo do input, sem portal */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              {suggestions.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  // onMouseDown previne blur no desktop antes do onClick
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(p)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-left
                    hover:bg-blue-50 active:bg-blue-100 transition-colors
                    ${i < suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-base font-semibold text-slate-900 truncate">{p.nome}</p>
                    <p className={`text-xs font-medium mt-0.5 ${p.estoque > 0 ? 'text-slate-400' : 'text-red-400'}`}>
                      {p.estoque > 0 ? `${p.estoque} em estoque` : 'Sem estoque'}
                    </p>
                  </div>
                  <p className="text-base font-black text-blue-600 shrink-0 tabular-nums">
                    {formatBRL(p.precoVenda)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão câmera */}
        <button
          type="button"
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
          onDetected={(barcode) => { onSubmit(barcode); setCameraOpen(false); }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </>
  );
}
