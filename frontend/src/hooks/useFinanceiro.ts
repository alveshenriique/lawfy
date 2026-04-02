import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { financeiroService } from '../services/financeiro';
import type { Financeiro } from '../types/financeiro';
import type { FinanceiroFormData } from '../lib/validations/financeiro';

export function useFinanceiro() {
  const [financeiros, setFinanceiros] = useState<Financeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  async function createFinanceiro(data: FinanceiroFormData) {
    try {
      setSaving(true);
      await financeiroService.create(data);
      await loadFinanceiro();
      toast.success('Contrato financeiro criado com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteFinanceiro(id: number) {
    try {
      setSaving(true);
      await financeiroService.remove(id);
      await loadFinanceiro();
      toast.success('Lançamento excluído com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function quitarParcela(id: number) {
    try {
      setSaving(true);
      await financeiroService.quitarParcela(id);
      await loadFinanceiro();
      toast.success('Parcela quitada com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadFinanceiro();
  }, [loadFinanceiro]);

  return {
    financeiros,
    loading,
    saving,
    error,
    refresh: loadFinanceiro,
    createFinanceiro,
    deleteFinanceiro,
    quitarParcela,
  };
}