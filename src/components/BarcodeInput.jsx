import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ScanLine, Camera, Search } from 'lucide-react';
import CameraScanner from './CameraScanner';
import { formatBRL } from '../utils/format';

// Escapes unicode explícito — caracteres invisíveis no source corrompem silenciosamente
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
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const isSearchMode = value.trim().length >= 2 && !/^\d+$/.test(value.trim());
  const suggestions = isSearchMode
    ? produtos
        .filter((p) => normalize(p.nome).includes(normalize(value)))
        .slice(0, 8)
    : [];

  const updateDropPos = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (showDropdown && suggestions.length > 0) updateDropPos();
  }, [showDropdown, suggestions.length, updateDropPos]);

  // Fecha ao interagir fora do input ou do dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleOutside = (e) => {
      if (
        !wrapperRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [showDropdown]);

  const handleChange = (e) => {
    setValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (produto) => {
    onAddById?.(produto.id);
    setValue('');
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      // Enter com sugestões visíveis → adiciona o primeiro (mais intuitivo)
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

  const dropdown =
    showDropdown && suggestions.length > 0
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            {suggestions.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onPointerDown={(e) => {
                  // pointerdown dispara ANTES do blur e ANTES do reflow do teclado no iOS
                  // e.preventDefault() cancela a mudança de foco (input não perde foco)
                  e.preventDefault();
                  handleSelect(p);
                }}
                className={`w-full flex items-center justify-between px-4 py-4 text-left
                  hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer
                  ${i < suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-base font-semibold text-slate-900 truncate leading-tight">
                    {p.nome}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${p.estoque > 0 ? 'text-slate-400' : 'text-red-400'}`}>
                    {p.estoque > 0 ? `${p.estoque} em estoque` : 'Sem estoque'}
                  </p>
                </div>
                <p className="text-base font-black text-blue-600 shrink-0 tabular-nums">
                  {formatBRL(p.precoVenda)}
                </p>
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={wrapperRef} className="relative flex gap-2">
        <div className="relative flex-1">
          {isSearchMode ? (
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
              size={20}
            />
          ) : (
            <ScanLine
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
              size={20}
            />
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => value.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Código de barras ou nome do produto"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full pl-12 pr-4 py-4 text-base font-medium rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white transition-colors placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => setCameraOpen(true)}
          className="shrink-0 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl flex items-center justify-center transition-all"
          title="Escanear com câmera"
        >
          <Camera size={20} />
        </button>

        {dropdown}
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
