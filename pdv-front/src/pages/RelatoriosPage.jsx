import React from 'react';
import {
  BarChart3, DollarSign, ShoppingBag, TrendingUp, RefreshCw,
  Trophy, Warehouse, AlertTriangle, Banknote, QrCode, CreditCard,
} from 'lucide-react';
import { useRelatorios } from '../hooks/useRelatorios';
import { formatBRL } from '../utils/format';

function Card({ children }) {
  return <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">{children}</div>;
}

function CardHeader({ icon, title, iconBg }) {
  return (
    <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-50">
      <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center`}>
        {React.cloneElement(icon, { size: 15, className: 'text-white' })}
      </div>
      <span className="text-sm font-bold text-slate-700">{title}</span>
    </div>
  );
}

function StatRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-black ${accent ?? 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

const PAY_ICONS = { DINHEIRO: <Banknote size={13} />, PIX: <QrCode size={13} />, CARTAO: <CreditCard size={13} /> };
const PAY_LABELS = { DINHEIRO: 'Dinheiro', PIX: 'Pix', CARTAO: 'Cartão' };
const PAY_CLS = { DINHEIRO: 'bg-green-100 text-green-700', PIX: 'bg-blue-100 text-blue-700', CARTAO: 'bg-slate-100 text-slate-700' };

export default function RelatoriosPage() {
  const { vendas, estoque, parados, loading, error, recarregar } = useRelatorios();

  const totalVendido    = vendas?.totalVendido ?? 0;
  const qtdVendas       = vendas?.quantidadeVendas ?? 0;
  const ticketMedio     = vendas?.ticketMedio ?? 0;
  const lucroTotal      = vendas?.lucroTotal ?? 0;
  const topProdutos     = vendas?.topProdutos ?? [];
  const formasPagamento = vendas?.formasPagamento ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
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

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-3">
        <p className="text-xs text-slate-400 font-medium px-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {loading && (
          <div className="text-center py-16 text-slate-300">
            <RefreshCw size={32} className="mx-auto animate-spin mb-3" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={recarregar} className="text-sm text-red-500 underline mt-2">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Vendas do dia */}
            <Card>
              <CardHeader icon={<DollarSign />} title="Vendas do dia" iconBg="bg-green-600" />
              <StatRow label="Total vendido"      value={formatBRL(totalVendido)} accent="text-green-700" />
              <StatRow label="Vendas realizadas"  value={`${qtdVendas} transaç${qtdVendas === 1 ? 'ão' : 'ões'}`} accent="text-blue-700" />
              <StatRow label="Ticket médio"       value={formatBRL(ticketMedio)}  accent="text-violet-700" />
              <StatRow label="Lucro do dia"       value={formatBRL(lucroTotal)}   accent="text-green-600" />
            </Card>

            {/* Estoque */}
            {estoque && (
              <Card>
                <CardHeader icon={<Warehouse />} title="Posição de estoque" iconBg="bg-emerald-600" />
                <StatRow label="Total de itens"     value={`${estoque.totalItens ?? 0} unidades`} accent="text-emerald-700" />
                <StatRow label="Valor de custo"     value={formatBRL(estoque.valorCusto ?? 0)} />
                <StatRow label="Valor de venda"     value={formatBRL(estoque.valorVenda ?? 0)} accent="text-emerald-700" />
                <StatRow label="Lucro potencial"    value={formatBRL(estoque.lucroAtePotencial ?? 0)} accent="text-green-600" />
              </Card>
            )}

            {/* Top produtos */}
            {topProdutos.length > 0 && (
              <Card>
                <CardHeader icon={<Trophy />} title="Mais vendidos hoje" iconBg="bg-amber-500" />
                <div className="divide-y divide-slate-50">
                  {topProdutos.map((item, i) => {
                    const medal = ['🥇','🥈','🥉'][i] ?? `${i+1}.`;
                    return (
                      <div key={i} className="px-5 py-3 flex items-center gap-3">
                        <span className="text-lg w-7 text-center shrink-0">{medal}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.nome}</p>
                          <p className="text-xs text-slate-400">{item.quantidade} un. · {formatBRL(item.receita)}</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 shrink-0">+{formatBRL(item.lucro)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Formas de pagamento */}
            {formasPagamento.length > 0 && (
              <Card>
                <CardHeader icon={<Banknote />} title="Formas de pagamento" iconBg="bg-blue-600" />
                <div className="divide-y divide-slate-50">
                  {formasPagamento.map((fp) => {
                    const key = fp.tipo?.toUpperCase();
                    return (
                      <div key={fp.tipo} className="px-5 py-3.5 flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${PAY_CLS[key] ?? 'bg-slate-100 text-slate-700'}`}>
                          {PAY_ICONS[key]}
                          {PAY_LABELS[key] ?? fp.tipo}
                        </span>
                        <span className="flex-1 text-xs text-slate-400">{fp.quantidade} {fp.quantidade === 1 ? 'venda' : 'vendas'}</span>
                        <span className="text-sm font-black text-slate-700">{formatBRL(fp.total)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Produtos parados */}
            {parados?.produtos?.length > 0 && (
              <Card>
                <CardHeader icon={<AlertTriangle />} title={`Parados há +${parados.diasSemVenda ?? 30} dias`} iconBg="bg-orange-500" />
                <div className="divide-y divide-slate-50">
                  {parados.produtos.slice(0, 10).map((p) => (
                    <div key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{p.nome}</p>
                        <p className="text-xs text-slate-400">{formatBRL(p.precoVenda)} / un.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-orange-600">{p.estoque} un.</p>
                        <p className="text-xs text-slate-400">{formatBRL(p.valorParado)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {qtdVendas === 0 && !loading && (
              <div className="text-center py-12 text-slate-300 select-none">
                <ShoppingBag size={48} strokeWidth={1} className="mx-auto mb-3" />
                <p className="text-sm font-semibold">Nenhuma venda hoje</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
