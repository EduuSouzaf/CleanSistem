import React, { useState } from 'react';
import {
  ShoppingCart, ScanLine, Banknote, QrCode, CreditCard, Trash2,
  Tag, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react';
import BarcodeInput from '../components/BarcodeInput';
import CartItem from '../components/CartItem';
import Toast from '../components/Toast';
import { useVendas } from '../hooks/useVendas';
import { formatBRL } from '../utils/format';
import { playBeep, playErrorBeep, playSuccessBeep } from '../utils/sound';

export default function VendasPage() {
  const {
    cart, allProdutos, subtotal, descontoValor, total, lucro, loading,
    desconto, setDesconto,
    addByBarcode, addById, updateQuantity, removeItem, clearCart, finalizarVenda,
  } = useVendas();

  const [toast, setToast] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [showDesconto, setShowDesconto] = useState(false);

  const showToast = (message, type) => setToast({ message, type });

  const handleBarcode = (barcode) => {
    const id = addByBarcode(barcode);
    if (id) {
      playBeep();
      setLastAddedId(id);
      setTimeout(() => setLastAddedId(null), 700);
    } else {
      playErrorBeep();
      showToast(`Produto "${barcode}" não encontrado`, 'error');
    }
  };

  const handleAddById = (produtoId) => {
    const id = addById(produtoId);
    if (id) {
      playBeep();
      setLastAddedId(id);
      setTimeout(() => setLastAddedId(null), 700);
    }
  };

  const handlePay = async (tipo) => {
    try {
      await finalizarVenda(tipo);
      playSuccessBeep();
      showToast('Venda finalizada com sucesso!', 'success');
      setShowDesconto(false);
    } catch (err) {
      showToast(err.message || 'Erro ao finalizar venda', 'error');
    }
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantidade, 0);
  const isEmpty = cart.length === 0;
  const hasDesconto = descontoValor > 0;

  const setQuickDesconto = (pct) =>
    setDesconto({ tipo: 'percentual', valor: String(pct) });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">Caixa</span>
        </div>
        {!isEmpty && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
            Cancelar
          </button>
        )}
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Scanner + carrinho */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="shrink-0 p-4 bg-white border-b border-slate-100">
            <BarcodeInput
              onSubmit={handleBarcode}
              produtos={allProdutos}
              onAddById={handleAddById}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 select-none py-8">
                <ScanLine size={56} strokeWidth={1} />
                <p className="mt-3 text-base font-semibold">Aponte o leitor</p>
                <p className="text-sm mt-1">ou digite o código acima e pressione Enter</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQty={updateQuantity}
                  onRemove={removeItem}
                  isNew={lastAddedId === item.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Painel de pagamento */}
        <div className="shrink-0 lg:w-72 xl:w-80 bg-white lg:border-l border-t border-slate-100 flex flex-col">

          {/* Totais */}
          <div className="px-5 pt-4 pb-3 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-3">
              {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : 'Carrinho vazio'}
            </p>

            {hasDesconto && (
              <>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Desconto</span>
                  <span>-{formatBRL(descontoValor)}</span>
                </div>
                <div className="border-t border-slate-100 pt-1" />
              </>
            )}

            <p className={`font-black tabular-nums leading-none text-center transition-all ${
              isEmpty ? 'text-4xl text-slate-200' : 'text-5xl text-slate-900'
            }`}>
              {formatBRL(total)}
            </p>

            {!isEmpty && lucro > 0 && (
              <p className="text-center text-xs font-semibold text-green-600">
                Lucro: {formatBRL(lucro)}
              </p>
            )}
          </div>

          {/* Desconto */}
          {!isEmpty && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowDesconto((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-500"
              >
                <div className="flex items-center gap-1.5">
                  <Tag size={14} />
                  <span>{hasDesconto ? `Desconto: -${formatBRL(descontoValor)}` : 'Adicionar desconto'}</span>
                </div>
                {showDesconto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDesconto && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl space-y-2">
                  {/* Botões rápidos */}
                  <div className="flex gap-1.5">
                    {[5, 10, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setQuickDesconto(pct)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          desconto.tipo === 'percentual' && desconto.valor === String(pct)
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-green-400'
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>

                  {/* Input manual */}
                  <div className="flex gap-1.5">
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden flex-1">
                      <button
                        onClick={() => setDesconto((d) => ({ ...d, tipo: 'valor' }))}
                        className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${
                          desconto.tipo === 'valor' ? 'bg-blue-600 text-white' : 'text-slate-500'
                        }`}
                      >R$</button>
                      <button
                        onClick={() => setDesconto((d) => ({ ...d, tipo: 'percentual' }))}
                        className={`px-2.5 py-1.5 text-xs font-bold transition-colors ${
                          desconto.tipo === 'percentual' ? 'bg-blue-600 text-white' : 'text-slate-500'
                        }`}
                      >%</button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={desconto.valor}
                      onChange={(e) => setDesconto((d) => ({ ...d, valor: e.target.value }))}
                      placeholder="0"
                      className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {desconto.valor && (
                      <button
                        onClick={() => setDesconto({ tipo: 'valor', valor: '' })}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-500"
                      >✕</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões de pagamento */}
          <div className="px-4 pb-5 mt-auto grid grid-cols-3 lg:grid-cols-1 gap-2">
            {[
              { tipo: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={18} />, cls: 'bg-green-600 hover:bg-green-700' },
              { tipo: 'PIX',      label: 'Pix',      icon: <QrCode size={18} />,   cls: 'bg-blue-600 hover:bg-blue-700'   },
              { tipo: 'CARTAO',   label: 'Cartão',   icon: <CreditCard size={18} />, cls: 'bg-slate-800 hover:bg-slate-900' },
            ].map(({ tipo, label, icon, cls }) => (
              <button
                key={tipo}
                onClick={() => handlePay(tipo)}
                disabled={isEmpty || loading}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1.5 ${cls} active:scale-95 text-white py-3.5 px-3 lg:px-5 rounded-2xl font-bold text-sm lg:text-base transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
