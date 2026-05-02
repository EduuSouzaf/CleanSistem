import React, { useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast';
import CameraButton from '../components/CameraButton';
import { useProdutos } from '../hooks/useProdutos';
import { formatBRL } from '../utils/format';

/* ─── Modal add/edit ─────────────────────────────────────────────────── */
function ProductModal({ produto, onSave, onClose }) {
  const [form, setForm] = useState({
    nome: produto?.nome ?? '',
    codigoBarras: produto?.codigoBarras ?? '',
    precoCusto: produto?.precoCusto ?? '',
    precoVenda: produto?.precoVenda ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório';
    if (!form.codigoBarras.trim()) e.codigoBarras = 'Obrigatório';
    if (!form.precoVenda || Number(form.precoVenda) <= 0) e.precoVenda = 'Valor inválido';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        nome: form.nome.trim(),
        codigoBarras: form.codigoBarras.trim(),
        precoCusto: Number(form.precoCusto) || 0,
        precoVenda: Number(form.precoVenda),
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={set(key)}
        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition ${
          errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 bg-white'
        }`}
        {...opts}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-900">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Nome do produto', 'nome', { placeholder: 'Ex: Coca-Cola 350ml', autoFocus: true })}

          {/* Código de barras com câmera */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Código de barras</label>
            <div className="flex gap-2">
              <input
                value={form.codigoBarras}
                onChange={set('codigoBarras')}
                placeholder="Ex: 7891234567890"
                className={`flex-1 px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition ${
                  errors.codigoBarras ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500 bg-white'
                }`}
              />
              <CameraButton onDetected={(code) => setForm((f) => ({ ...f, codigoBarras: code }))} />
            </div>
            {errors.codigoBarras && <p className="text-xs text-red-500 mt-1">{errors.codigoBarras}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('Preço de custo (R$)', 'precoCusto', { type: 'number', step: '0.01', min: '0', placeholder: '0,00' })}
            {field('Preço de venda (R$)', 'precoVenda', { type: 'number', step: '0.01', min: '0.01', placeholder: '0,00' })}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-50 mt-2"
          >
            {saving ? 'Salvando...' : produto ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Dialog de confirmação ──────────────────────────────────────────── */
function ConfirmDialog({ nomeProduto, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl animate-scale-in text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h3 className="font-black text-slate-900 text-lg mb-1">Excluir produto?</h3>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-semibold text-slate-700">{nomeProduto}</span>
          <br />Esta ação não pode ser desfeita.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="py-3 rounded-2xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="py-3 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold transition-all">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ───────────────────────────────────────────────── */
export default function ProdutosPage() {
  const { produtos, loading, error, criarProduto, editarProduto, excluirProduto } = useProdutos();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | produto
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => setToast({ message, type });

  const filtered = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.codigoBarras.includes(search)
  );

  const handleSave = async (data) => {
    try {
      if (modal && typeof modal === 'object') {
        await editarProduto(modal.id, data);
        showToast('Produto atualizado!', 'success');
      } else {
        await criarProduto(data);
        showToast('Produto cadastrado!', 'success');
      }
      setModal(null);
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const deletingProduto = produtos.find((p) => p.id === deletingId);

  const handleDelete = async () => {
    try {
      await excluirProduto(deletingId);
      showToast('Produto excluído!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight">Produtos</span>
          </div>
          <button
            onClick={() => setModal('new')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none text-sm bg-slate-50 focus:bg-white transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <CameraButton onDetected={(code) => setSearch(code)} size="sm" />
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && (
          <div className="text-center py-12 text-slate-400 text-sm">Carregando...</div>
        )}
        {error && (
          <div className="text-center py-12 text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <Package size={48} strokeWidth={1} />
            <p className="mt-3 font-semibold text-sm">
              {search ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
          </div>
        )}

        {filtered.map((produto) => (
          <div
            key={produto.id}
            className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm leading-snug">{produto.nome}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{produto.codigoBarras}</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-slate-500">
                    Custo: <span className="font-semibold text-slate-700">{formatBRL(produto.precoCusto)}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Venda: <span className="font-bold text-blue-600">{formatBRL(produto.precoVenda)}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    produto.estoque > 5
                      ? 'bg-green-100 text-green-700'
                      : produto.estoque > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {produto.estoque} un.
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal(produto)}
                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-90 flex items-center justify-center text-blue-600 transition-all"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingId(produto.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 active:scale-90 flex items-center justify-center text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {modal !== null && (
        <ProductModal
          produto={typeof modal === 'object' ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deletingId && (
        <ConfirmDialog
          nomeProduto={deletingProduto?.nome ?? ''}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
