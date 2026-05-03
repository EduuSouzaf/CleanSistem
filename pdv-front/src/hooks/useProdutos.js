import { useState, useEffect, useCallback } from 'react';
import { getProdutos, createProduto, updateProduto, deleteProduto } from '../services/produtosService';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProdutos();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criarProduto = async (data) => {
    const novo = await createProduto(data);
    setProdutos((prev) => [...prev, novo]);
    return novo;
  };

  const editarProduto = async (id, data) => {
    const atualizado = await updateProduto(id, data);
    setProdutos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
    return atualizado;
  };

  const excluirProduto = async (id) => {
    await deleteProduto(id);
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  return { produtos, loading, error, criarProduto, editarProduto, excluirProduto, recarregar: carregar };
}
