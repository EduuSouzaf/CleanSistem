import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { formatBRL } from '../utils/format';

export default function CartItem({ item, onUpdateQty, onRemove, isNew }) {
  const lucroItem = (item.precoVenda - (item.precoCusto ?? 0)) * item.quantidade;

  return (
    <div
      className={`bg-white rounded-2xl px-3 py-2.5 shadow-sm border flex items-center gap-2 transition-all duration-200 ${
        isNew ? 'animate-flash-green border-green-300' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Nome + preço/un */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{item.nome}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {formatBRL(item.precoVenda)}/un.
          {lucroItem > 0 && (
            <span className="text-green-600 font-semibold ml-1">+{formatBRL(lucroItem)}</span>
          )}
        </p>
      </div>

      {/* Controles de quantidade */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUpdateQty(item.id, item.quantidade - 1)}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition-all"
        >
          <Minus size={11} strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center font-black text-slate-900 text-sm">{item.quantidade}</span>
        <button
          onClick={() => onUpdateQty(item.id, item.quantidade + 1)}
          className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 active:scale-90 flex items-center justify-center text-blue-600 transition-all"
        >
          <Plus size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* Total do item */}
      <p className="font-black text-slate-900 text-sm w-14 text-right shrink-0 tabular-nums">
        {formatBRL(item.precoVenda * item.quantidade)}
      </p>

      {/* Remover */}
      <button
        onClick={() => onRemove(item.id)}
        className="w-6 h-6 rounded-full hover:bg-red-100 active:scale-90 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shrink-0"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
