import { useState, useEffect, useCallback } from 'react';
import { processosService } from '../services/processos';
import { type Processo } from '../types/processo';
import { type ProcessoFormData } from '../lib/validations/processo'; // Importe seu Schema aqui

export function useProcessos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Novo estado para os Modais
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

  useEffect(() => {
    loadProcessos();
  }, [loadProcessos]);

  // --- Funções de Escrita (O que faltava para a página) ---

  async function createProcesso(data: ProcessoFormData) {
    setSaving(true);
    try {
      await processosService.create(data);
      await loadProcessos(); // Atualiza a lista após criar
    } catch (err) {
      setError('Erro ao criar processo.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function updateProcesso(id: number, data: ProcessoFormData) {
    setSaving(true);
    try {
      await processosService.update(id, data);
      await loadProcessos(); // Atualiza a lista após editar
    } catch (err) {
      setError('Erro ao atualizar processo.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteProcesso(id: number) {
    setSaving(true);
    try {
      await processosService.remove(id);
      await loadProcessos();
    } catch (err) {
      setError('Erro ao excluir processo.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return { 
    processos, 
    loading, 
    saving, // Agora a página vai encontrar!
    error, 
    refresh: loadProcessos,
    createProcesso, // Agora a página vai encontrar!
    updateProcesso,
    deleteProcesso
  };
}