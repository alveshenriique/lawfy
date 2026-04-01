import { useState, useEffect, useCallback } from 'react';
import { clientesService } from '../services/clientes';
import type { Cliente } from '../types/cliente';
import type { ClienteFormData } from '../lib/validations/cliente';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      setError('Não foi possível carregar a lista de clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createCliente(data: ClienteFormData) {
    try {
      setSaving(true);
      const cleanData = {
        ...data,
        cpf_cnpj: data.cpf_cnpj.replace(/\D/g, ''),
        telefone: data.telefone ? data.telefone.replace(/\D/g, '') : undefined,
      };
      await clientesService.create(cleanData);
      await loadClientes();
    } catch (err) {
      setError('Não foi possível cadastrar o cliente.');
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function updateCliente(id: number, data: ClienteFormData) {
    try {
      setSaving(true);
      const cleanData = {
        ...data,
        cpf_cnpj: data.cpf_cnpj.replace(/\D/g, ''),
        telefone: data.telefone ? data.telefone.replace(/\D/g, '') : undefined,
      };
      await clientesService.update(id, cleanData);
      await loadClientes();
    } catch (err) {
      setError('Não foi possível atualizar o cliente.');
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteCliente(id: number) {
    try {
      setSaving(true);
      await clientesService.remove(id);
      await loadClientes();
    } catch (err) {
      setError('Não foi possível excluir o cliente.');
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    loading,
    saving,
    error,
    refresh: loadClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}