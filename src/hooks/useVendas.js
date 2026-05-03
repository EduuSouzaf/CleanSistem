import { useState, useEffect, useCallback } from 'react';
import { getProdutos } from '../services/produtosService';
import { registrarVenda } from '../services/vendasService';

export function useVendas() {
  const [cart, setCart] = useState([]);
  const [allProdutos, setAllProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Retorna o ID do produto adicionado (para animação) ou null se não encontrado
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

  const clearCart = useCallback(() => setCart([]), []);

  const total = cart.reduce((sum, item) => sum + item.precoVenda * item.quantidade, 0);

  const finalizarVenda = async (tipoPagamento) => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await registrarVenda({
        tipoPagamento,
        total,
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
    // erros propagam para o chamador
  };

  return {
    cart,
    total,
    loading,
    addByBarcode,
    updateQuantity,
    removeItem,
    clearCart,
    finalizarVenda,
    recarregarProdutos,
  };
}
