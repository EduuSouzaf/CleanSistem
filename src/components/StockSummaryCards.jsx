import React, { useEffect, useState } from 'react';
import { Package, CreditCard, ShoppingCart, TrendingUp } from 'lucide-react';
import { getDashboardEstoque } from '../services/produtosService';
import { formatBRL } from '../utils/format';

const CARDS = [
  {
    key: 'totalItens',
    label: 'Itens',
    icon: Package,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    textColor: 'text-slate-900',
    format: (v) => (v ?? 0).toLocaleString('pt-BR'),
  },
  {
    key: 'valorCusto',
    label: 'Custo',
    icon: CreditCard,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    textColor: 'text-slate-700',
    format: formatBRL,
  },
  {
    key: 'valorVenda',
    label: 'Venda',
    icon: ShoppingCart,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-700',
    format: formatBRL,
  },
  {
    key: 'lucroPotencial',
    label: 'Lucro',
    icon: TrendingUp,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    textColor: 'text-green-700',
    format: formatBRL,
  },
];

export default function StockSummaryCards({ refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    getDashboardEstoque()
      .then((d) => {
        setData(d);
        setAnimKey((k) => k + 1);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 py-3">
      {CARDS.map(({ key, label, icon: Icon, iconBg, iconColor, textColor, format }) => (
        <div
          key={key}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3.5 py-3 flex items-center gap-2.5"
        >
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={17} className={iconColor} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium leading-none mb-1">{label}</p>
            {loading ? (
              <div className="h-4 w-14 bg-slate-100 rounded-md animate-pulse" />
            ) : (
              <p
                key={animKey}
                className={`text-sm font-black ${textColor} leading-tight animate-fade-in`}
              >
                {data != null ? format(data[key]) : '–'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
