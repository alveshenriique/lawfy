import { useState, useEffect, useCallback } from 'react';
import { financeiroService } from '../services/financeiro';
import { type Financeiro } from '../types/financeiro';

export function useFinanceiro() {
  const [financeiros, setFinanceiros] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinanceiro = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeiroService.getAll();
      setFinanceiros(data);
    } catch (err) {
      setError('Não foi possível carregar o financeiro.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceiro();
  }, [loadFinanceiro]);

  return { financeiros, loading, error, refresh: loadFinanceiro };
}