import { useState, useEffect, useCallback } from 'react';
import { getVendasDia } from '../services/relatoriosService';

export function useRelatorios() {
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVendasDia();
      setRelatorio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { relatorio, loading, error, recarregar: carregar };
}
