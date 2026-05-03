import React, { useState } from 'react';
import {
  ShoppingCart, ScanLine, Banknote, QrCode, CreditCard, Trash2,
} from 'lucide-react';
import BarcodeInput from '../components/BarcodeInput';
import CartItem from '../components/CartItem';
import Toast from '../components/Toast';
import { useVendas } from '../hooks/useVendas';
import { formatBRL } from '../utils/format';
import { playBeep, playErrorBeep, playSuccessBeep } from '../utils/sound';

export default function VendasPage() {
  const {
    cart, total, loading,
    addByBarcode, updateQuantity, removeItem, clearCart, finalizarVenda,
  } = useVendas();

  const [toast, setToast] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);

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

  const handlePay = async (tipo) => {
    try {
      await finalizarVenda(tipo);
      playSuccessBeep();
      showToast('Venda finalizada com sucesso!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao finalizar venda', 'error');
    }
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantidade, 0);
  const isEmpty = cart.length === 0;

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
            <span>Cancelar</span>
          </button>
        )}
      </header>

      {/* Content — dois painéis em desktop */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* Painel esquerdo: scanner + carrinho */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="shrink-0 p-4 bg-white border-b border-slate-100">
            <BarcodeInput onSubmit={handleBarcode} cartLength={cart.length} />
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

        {/* Painel direito/inferior: total + pagamento */}
        <div className="shrink-0 lg:w-72 xl:w-80 bg-white lg:border-l border-t border-slate-100">
          {/* Total */}
          <div className="px-5 pt-5 pb-4 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {itemCount > 0
                ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`
                : 'Carrinho vazio'}
            </p>
            <p
              className={`font-black tabular-nums leading-none transition-all ${
                isEmpty
                  ? 'text-4xl text-slate-200'
                  : 'text-5xl text-slate-900'
              }`}
            >
              {formatBRL(total)}
            </p>
          </div>

          {/* Botões de pagamento */}
          <div className="px-4 pb-5 grid grid-cols-3 lg:grid-cols-1 gap-2">
            {[
              {
                tipo: 'DINHEIRO',
                label: 'Dinheiro',
                icon: <Banknote size={18} />,
                cls: 'bg-green-600 hover:bg-green-700',
              },
              {
                tipo: 'PIX',
                label: 'Pix',
                icon: <QrCode size={18} />,
                cls: 'bg-blue-600 hover:bg-blue-700',
              },
              {
                tipo: 'CARTAO',
                label: 'Cartão',
                icon: <CreditCard size={18} />,
                cls: 'bg-slate-800 hover:bg-slate-900',
              },
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
