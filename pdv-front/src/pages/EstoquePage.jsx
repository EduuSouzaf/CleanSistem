import React, { useState } from 'react';
import { Boxes, ScanLine, Plus, PackageCheck } from 'lucide-react';
import Toast from '../components/Toast';
import CameraButton from '../components/CameraButton';
import { useProdutos } from '../hooks/useProdutos';
import { registrarEntrada } from '../services/estoqueService';
import { formatBRL } from '../utils/format';

export default function EstoquePage() {
  const { produtos } = useProdutos();
  const [search, setSearch] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [localCompra, setLocalCompra] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => setToast({ message: msg, type });

  const handleSearch = (val) => {
    setSearch(val);
    const match = produtos.find(
      (p) => p.codigoBarras === val.trim() || p.nome.toLowerCase() === val.toLowerCase().trim()
    );
    if (match) setSelecionado(match);
  };

  const handleSelect = (produto) => {
    setSelecionado(produto);
    setSearch(produto.nome);
    setPrecoCusto(String(produto.precoCusto));
  };

  const sugestoes = search && !selecionado
    ? produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(search.toLowerCase()) ||
          p.codigoBarras.includes(search)
      ).slice(0, 5)
    : [];

  const handleSalvar = async () => {
    if (!selecionado) return showToast('Selecione um produto', 'error');
    if (!quantidade || Number(quantidade) <= 0) return showToast('Quantidade inválida', 'error');
    setSaving(true);
    try {
      await registrarEntrada({
        produtoId: selecionado.id,
        quantidade: Number(quantidade),
        precoCusto: Number(precoCusto) || 0,
        localCompra: localCompra.trim() || undefined,
      });
      showToast(`+${quantidade} unidade(s) de "${selecionado.nome}" registrado!`, 'success');
      setSelecionado(null);
      setSearch('');
      setQuantidade('');
      setPrecoCusto('');
      setLocalCompra('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
          <Boxes size={16} className="text-white" />
        </div>
        <span className="font-black text-slate-900 text-lg tracking-tight">Entrada de Estoque</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">

        {/* Campo de busca */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Produto
          </label>
          <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSelecionado(null); handleSearch(e.target.value); }}
              placeholder="Nome ou código de barras..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white text-sm transition-colors"
            />
            {sugestoes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10">
                {sugestoes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.nome}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.codigoBarras}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${p.estoque > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {p.estoque} un.
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <CameraButton onDetected={(code) => { setSelecionado(null); handleSearch(code); }} />
        </div>
        </div>

        {/* Card do produto selecionado */}
        {selecionado && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <PackageCheck size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{selecionado.nome}</p>
              <p className="text-xs text-slate-500 font-mono">{selecionado.codigoBarras}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-black ${selecionado.estoque > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {selecionado.estoque} un.
              </p>
              <p className="text-xs text-slate-400">em estoque</p>
            </div>
          </div>
        )}

        {/* Quantidade */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Quantidade a adicionar
          </label>
          <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors overflow-hidden">
            <button
              onClick={() => setQuantidade((q) => String(Math.max(1, (Number(q) || 1) - 1)))}
              className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
            >
              <span className="text-2xl leading-none">−</span>
            </button>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              min="1"
              className="flex-1 text-center text-3xl font-black text-slate-900 focus:outline-none py-3 bg-transparent"
            />
            <button
              onClick={() => setQuantidade((q) => String((Number(q) || 0) + 1))}
              className="w-14 h-14 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Preço de custo */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Preço de custo (R$) <span className="text-slate-300 normal-case font-normal">— opcional</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precoCusto}
            onChange={(e) => setPrecoCusto(e.target.value)}
            placeholder="0,00"
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm bg-white transition-colors"
          />
          {selecionado && precoCusto && (
            <p className="text-xs text-slate-400 mt-1.5">
              Atual: {formatBRL(selecionado.precoCusto)} → Novo: {formatBRL(Number(precoCusto))}
            </p>
          )}
        </div>

        {/* Local de compra */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Local de compra <span className="text-slate-300 normal-case font-normal">— opcional</span>
          </label>
          <input
            type="text"
            value={localCompra}
            onChange={(e) => setLocalCompra(e.target.value)}
            placeholder="Ex: Fornecedor ABC, Mercado Central..."
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-sm bg-white transition-colors"
          />
        </div>

        {/* Botão */}
        <button
          onClick={handleSalvar}
          disabled={saving || !selecionado || !quantidade}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <PackageCheck size={20} />
          {saving ? 'Registrando...' : 'Registrar Entrada'}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
