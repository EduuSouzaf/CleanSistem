import React, { useEffect, useState, useCallback } from 'react';
import {
  Receipt, RefreshCw, ChevronDown, ChevronUp, RotateCcw,
  Banknote, QrCode, CreditCard, X, Check,
} from 'lucide-react';
import Toast from '../components/Toast';
import { listarVendas, devolverVenda, getDevolucoes } from '../services/vendasService';
import { formatBRL } from '../utils/format';

const PAY_LABELS = { DINHEIRO: 'Dinheiro', PIX: 'Pix', CARTAO: 'Cartão' };
const PAY_CLS = { DINHEIRO: 'bg-green-100 text-green-700', PIX: 'bg-blue-100 text-blue-700', CARTAO: 'bg-slate-100 text-slate-700' };
const PAY_ICONS = { DINHEIRO: <Banknote size={12} />, PIX: <QrCode size={12} />, CARTAO: <CreditCard size={12} /> };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DevolucaoModal({ venda, onClose, onSuccess }) {
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [erroHistorico, setErroHistorico] = useState(null);
  const [qtds, setQtds] = useState(
    Object.fromEntries(venda.itens.map((i) => [i.produtoId, 0]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Busca devoluções anteriores para calcular saldo disponível
  useEffect(() => {
    getDevolucoes(venda.id)
      .then((data) => setHistorico(Array.isArray(data) ? data : []))
      .catch(() => setErroHistorico('Não foi possível verificar devoluções anteriores. Feche e tente novamente.'))
      .finally(() => setLoadingHistorico(false));
  }, [venda.id]);

  // jaDevolvido por produto, somando todas as devoluções anteriores
  const jaDevolvido = {};
  historico.forEach((dev) =>
    dev.itens?.forEach((i) => {
      jaDevolvido[i.produtoId] = (jaDevolvido[i.produtoId] ?? 0) + i.quantidade;
    })
  );

  const disponivel = (produtoId, vendido) =>
    vendido - (jaDevolvido[produtoId] ?? 0);

  const setQtd = (produtoId, vendido, val) => {
    const max = disponivel(produtoId, vendido);
    setQtds((q) => ({ ...q, [produtoId]: Math.min(Math.max(0, Math.floor(Number(val))), max) }));
  };

  const itensDevolver = venda.itens
    .filter((i) => qtds[i.produtoId] > 0)
    .map((i) => ({ produtoId: i.produtoId, quantidade: qtds[i.produtoId] }));

  const handleDevolver = async () => {
    if (itensDevolver.length === 0) return setError('Selecione ao menos um item.');
    // Validação frontend antes de enviar
    for (const item of itensDevolver) {
      const vendaItem = venda.itens.find((i) => i.produtoId === item.produtoId);
      const disp = disponivel(item.produtoId, vendaItem.quantidade);
      if (item.quantidade > disp) {
        return setError(`Quantidade inválida para "${vendaItem.nomeProduto}" (disponível: ${disp}).`);
      }
    }
    setSaving(true);
    setError(null);
    try {
      await devolverVenda(venda.id, itensDevolver);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end lg:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-orange-500" />
            <span className="font-bold text-slate-900">Registrar devolução</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {loadingHistorico ? (
            <p className="text-xs text-slate-400 text-center py-4">Verificando devoluções anteriores...</p>
          ) : erroHistorico ? (
            <p className="text-sm text-red-600 font-medium text-center py-4">{erroHistorico}</p>
          ) : (
            venda.itens.map((item) => {
              const jaDev = jaDevolvido[item.produtoId] ?? 0;
              const disp  = disponivel(item.produtoId, item.quantidade);
              const esgotado = disp <= 0;

              return (
                <div key={item.produtoId} className={`rounded-xl px-4 py-3 ${esgotado ? 'bg-slate-50 opacity-60' : 'bg-orange-50 border border-orange-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.nomeProduto}</p>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>Vendidos: <b className="text-slate-700">{item.quantidade}</b></span>
                        {jaDev > 0 && <span>Devolvidos: <b className="text-orange-600">{jaDev}</b></span>}
                        <span>Disponível: <b className={disp > 0 ? 'text-green-700' : 'text-red-500'}>{disp}</b></span>
                      </div>
                    </div>
                    {esgotado ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                        Devolvido
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max={disp}
                        step="1"
                        value={qtds[item.produtoId]}
                        onChange={(e) => setQtd(item.produtoId, item.quantidade, e.target.value)}
                        className="w-16 text-center text-sm font-bold px-2 py-1.5 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none bg-white shrink-0"
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && <p className="px-5 pb-2 text-sm text-red-600 font-medium">{error}</p>}

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleDevolver}
            disabled={saving || itensDevolver.length === 0 || loadingHistorico || !!erroHistorico}
            className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {saving ? 'Devolvendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendaCard({ venda, onDevolver }) {
  const [open, setOpen] = useState(false);
  const key = venda.tipoPagamento?.toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-900">{formatBRL(venda.total)}</span>
            {venda.desconto > 0 && (
              <span className="text-xs text-green-600 font-semibold">-{formatBRL(venda.desconto)} desc.</span>
            )}
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${PAY_CLS[key] ?? 'bg-slate-100 text-slate-700'}`}>
              {PAY_ICONS[key]}
              {PAY_LABELS[key] ?? venda.tipoPagamento}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(venda.data)} · {venda.itens?.length ?? 0} produto(s)</p>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-50">
          <div className="divide-y divide-slate-50">
            {venda.itens?.map((item) => (
              <div key={item.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-800 font-medium">{item.nomeProduto}</p>
                  <p className="text-xs text-slate-400">{item.quantidade} × {formatBRL(item.precoUnitario)}</p>
                </div>
                <span className="text-sm font-bold text-slate-700">{formatBRL(item.quantidade * item.precoUnitario)}</span>
              </div>
            ))}
          </div>
          {venda.lucro > 0 && (
            <p className="px-4 py-2 text-xs text-green-600 font-semibold border-t border-slate-50">
              Lucro: {formatBRL(venda.lucro)}
            </p>
          )}
          <div className="px-4 pb-3 pt-1">
            <button
              onClick={() => onDevolver(venda)}
              className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              <RotateCcw size={14} />
              Registrar devolução
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendasHistoricoPage() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendaDevolvendo, setVendaDevolvendo] = useState(null);
  const [toast, setToast] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarVendas();
      setVendas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Receipt size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">Histórico de Vendas</span>
        </div>
        <button
          onClick={carregar}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-2">
        {loading && (
          <div className="text-center py-16 text-slate-300">
            <RefreshCw size={32} className="mx-auto animate-spin mb-3" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button onClick={carregar} className="text-sm text-red-500 underline mt-2">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && vendas.length === 0 && (
          <div className="text-center py-16 text-slate-300 select-none">
            <Receipt size={48} strokeWidth={1} className="mx-auto mb-3" />
            <p className="text-sm font-semibold">Nenhuma venda registrada</p>
          </div>
        )}

        {vendas.map((venda) => (
          <VendaCard key={venda.id} venda={venda} onDevolver={setVendaDevolvendo} />
        ))}
      </div>

      {vendaDevolvendo && (
        <DevolucaoModal
          venda={vendaDevolvendo}
          onClose={() => setVendaDevolvendo(null)}
          onSuccess={() => {
            setToast({ message: 'Devolução registrada! Estoque atualizado.', type: 'success' });
            carregar();
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
