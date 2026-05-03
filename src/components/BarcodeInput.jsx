import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScanLine } from 'lucide-react';

export default function BarcodeInput({ onSubmit, cartLength }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const refocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

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

  return (
    <div className="relative">
      <ScanLine
        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
        size={22}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escanear ou digitar código de barras..."
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full pl-12 pr-4 py-4 text-base font-medium rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white transition-colors placeholder:text-slate-400"
      />
    </div>
  );
}
