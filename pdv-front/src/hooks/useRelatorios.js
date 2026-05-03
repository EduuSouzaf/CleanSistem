import { useState, useEffect, useCallback } from 'react';
import { getVendasDia, getEstoque, getProdutosParados } from '../services/relatoriosService';

export function useRelatorios() {
  const [vendas, setVendas] = useState(null);
  const [estoque, setEstoque] = useState(null);
  const [parados, setParados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, e, p] = await Promise.all([getVendasDia(), getEstoque(), getProdutosParados()]);
      setVendas(v);
      setEstoque(e);
      setParados(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { vendas, estoque, parados, loading, error, recarregar: carregar };
}
