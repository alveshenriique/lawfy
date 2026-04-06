import { useState, useEffect, useCallback } from 'react';
import { dashboardService, type DashboardResumo } from '../services/dashboard';

export function useDashboard() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResumo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getResumo();
      setResumo(data);
    } catch (err) {
      setError('Não foi possível carregar o resumo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumo();
  }, [loadResumo]);

  return { resumo, loading, error, refresh: loadResumo };
}