import { useState, useEffect, useCallback } from 'react';
import { getProdutos } from '../services/produtosService';
import { registrarVenda } from '../services/vendasService';

export function useVendas() {
  const [cart, setCart] = useState([]);
  const [allProdutos, setAllProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [desconto, setDesconto] = useState({ tipo: 'valor', valor: '' });

  useEffect(() => {
    getProdutos()
      .then((data) => setAllProdutos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const recarregarProdutos = useCallback(async () => {
    try {
      const data = await getProdutos();
      setAllProdutos(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const addByBarcode = useCallback((barcode) => {
    const produto = allProdutos.find(
      (p) => String(p.codigoBarras) === String(barcode)
    );
    if (!produto) return null;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === produto.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantidade: updated[idx].quantidade + 1 };
        return updated;
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });

    return produto.id;
  }, [allProdutos]);

  const addById = useCallback((produtoId) => {
    const produto = allProdutos.find((p) => p.id === produtoId);
    if (!produto) return null;

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === produto.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantidade: updated[idx].quantidade + 1 };
        return updated;
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });

    return produto.id;
  }, [allProdutos]);

  const updateQuantity = useCallback((produtoId, qty) => {
    const n = Number(qty);
    setCart((prev) => {
      if (n <= 0) return prev.filter((i) => i.id !== produtoId);
      return prev.map((i) => (i.id === produtoId ? { ...i, quantidade: n } : i));
    });
  }, []);

  const removeItem = useCallback((produtoId) => {
    setCart((prev) => prev.filter((i) => i.id !== produtoId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDesconto({ tipo: 'valor', valor: '' });
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.precoVenda * item.quantidade, 0);

  const descontoValor = (() => {
    const v = parseFloat(desconto.valor) || 0;
    if (desconto.tipo === 'percentual') return Math.min(subtotal * v / 100, subtotal);
    return Math.min(v, subtotal);
  })();

  const total = Math.max(0, subtotal - descontoValor);

  const lucro = cart.reduce(
    (sum, item) => sum + (item.precoVenda - (item.precoCusto ?? 0)) * item.quantidade,
    0
  ) - descontoValor;

  const finalizarVenda = async (tipoPagamento) => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await registrarVenda({
        tipoPagamento,
        desconto: descontoValor,
        itens: cart.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.precoVenda,
        })),
      });
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    allProdutos,
    subtotal,
    descontoValor,
    total,
    lucro,
    loading,
    desconto,
    setDesconto,
    addByBarcode,
    addById,
    updateQuantity,
    removeItem,
    clearCart,
    finalizarVenda,
    recarregarProdutos,
  };
}
