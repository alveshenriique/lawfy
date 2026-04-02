import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { processosService } from '../services/processos';
import type { Processo } from '../types/processo';
import type { ProcessoFormData } from '../lib/validations/processo';

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProcessos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await processosService.getAll();
      setProcessos(data);
    } catch (err) {
      setError('Não foi possível carregar a lista de processos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createProcesso(data: ProcessoFormData) {
    try {
      setSaving(true);
      const cleanData = {
        ...data,
        numero_processo: data.numero_processo && data.numero_processo.replace(/\D/g, '').length > 0
          ? data.numero_processo
          : null,
      };
      await processosService.create(cleanData);
      await loadProcessos();
      toast.success('Processo cadastrado com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function updateProcesso(id: number, data: ProcessoFormData) {
    try {
      setSaving(true);
      const cleanData = {
        ...data,
        numero_processo: data.numero_processo && data.numero_processo.replace(/\D/g, '').length > 0
          ? data.numero_processo
          : null,
      };
      await processosService.update(id, cleanData);
      await loadProcessos();
      toast.success('Processo atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteProcesso(id: number) {
    try {
      setSaving(true);
      await processosService.remove(id);
      await loadProcessos();
      toast.success('Processo excluído com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProcessos();
  }, [loadProcessos]);

  return {
    processos,
    loading,
    saving,
    error,
    refresh: loadProcessos,
    createProcesso,
    updateProcesso,
    deleteProcesso,
  };
}