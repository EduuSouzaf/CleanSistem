import React from 'react';
import { BarChart3, DollarSign, ShoppingBag, TrendingUp, RefreshCw, Trophy } from 'lucide-react';
import Toast from '../components/Toast';
import { useRelatorios } from '../hooks/useRelatorios';
import { formatBRL } from '../utils/format';

function MetricCard({ icon, label, value, sub, color }) {
  const colors = {
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'bg-green-600',  text: 'text-green-700'  },
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'bg-blue-600',   text: 'text-blue-700'   },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500', text: 'text-orange-700' },
  };
  const c = colors[color] ?? colors.blue;

  return (
    <div className={`${c.bg} border ${c.border} rounded-3xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.icon} rounded-2xl flex items-center justify-center`}>
          {React.cloneElement(icon, { size: 18, className: 'text-white' })}
        </div>
      </div>
      <p className={`text-3xl font-black ${c.text} leading-none`}>{value}</p>
      <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function RelatoriosPage() {
  const { relatorio, loading, error, recarregar } = useRelatorios();

  const totalVendido = relatorio?.totalVendido ?? relatorio?.total ?? 0;
  const qtdVendas    = relatorio?.quantidadeVendas ?? relatorio?.totalVendas ?? 0;
  const topProdutos  = relatorio?.topProdutos ?? relatorio?.produtosMaisVendidos ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">Relatórios</span>
        </div>
        <button
          onClick={recarregar}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Data */}
        <p className="text-xs text-slate-400 font-medium">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {loading && (
          <div className="text-center py-16 text-slate-300">
            <RefreshCw size={32} className="mx-auto animate-spin mb-3" />
            <p className="text-sm">Carregando...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={recarregar} className="text-sm text-red-500 underline mt-2">
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Cards de métricas */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<DollarSign />}
                label="Total do dia"
                value={formatBRL(totalVendido)}
                color="green"
              />
              <MetricCard
                icon={<ShoppingBag />}
                label="Vendas realizadas"
                value={String(qtdVendas)}
                sub={qtdVendas === 1 ? '1 transação' : `${qtdVendas} transações`}
                color="blue"
              />
            </div>

            {/* Ticket médio */}
            {qtdVendas > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <TrendingUp size={18} className="text-violet-500" />
                  <span className="text-sm font-semibold text-slate-700">Ticket médio</span>
                </div>
                <span className="text-base font-black text-violet-600">
                  {formatBRL(totalVendido / qtdVendas)}
                </span>
              </div>
            )}

            {/* Mais vendidos */}
            {topProdutos.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-700">Mais vendidos hoje</h3>
                </div>
                <div className="space-y-2">
                  {topProdutos.map((item, i) => {
                    const nome = item.nome ?? item.produto;
                    const qty  = item.quantidade ?? item.totalVendido;
                    const medal = ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`;
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                        <span className="text-xl w-7 text-center shrink-0">{medal}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{nome}</p>
                        </div>
                        <span className="text-sm font-black text-slate-700 shrink-0">{qty} un.</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              !loading && (
                <div className="text-center py-10 text-slate-300">
                  <ShoppingBag size={40} strokeWidth={1} className="mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhuma venda hoje</p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
