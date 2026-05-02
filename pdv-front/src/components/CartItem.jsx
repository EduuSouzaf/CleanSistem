import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { formatBRL } from '../utils/format';

export default function CartItem({ item, onUpdateQty, onRemove, isNew }) {
  return (
    <div
      className={`bg-white rounded-2xl p-3.5 shadow-sm border flex items-center gap-3 transition-all duration-200 ${
        isNew
          ? 'animate-flash-green border-green-300'
          : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{item.nome}</p>
        <p className="text-xs text-slate-400 mt-0.5">{formatBRL(item.precoVenda)} / un.</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onUpdateQty(item.id, item.quantidade - 1)}
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition-all"
        >
          <Minus size={12} strokeWidth={2.5} />
        </button>
        <span className="w-7 text-center font-black text-slate-900 text-sm">{item.quantidade}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.quantidade + 1)}
          className="w-7 h-7 rounded-full bg-blue-100 hover:bg-blue-200 active:scale-90 flex items-center justify-center text-blue-600 transition-all"
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>

      {/* Subtotal */}
      <p className="font-black text-slate-900 text-sm w-16 text-right shrink-0">
        {formatBRL(item.precoVenda * item.quantidade)}
      </p>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-full hover:bg-red-100 active:scale-90 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shrink-0"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
