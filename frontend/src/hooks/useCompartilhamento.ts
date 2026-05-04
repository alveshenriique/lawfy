import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { compartilhamentoService } from '../services/compartilhamento';

export function useCompartilhamento() {
  const [clientesCompartilhados, setClientesCompartilhados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const ids = await compartilhamentoService.meusCompartilhados();
      setClientesCompartilhados(new Set(ids));
    } catch {
      // silencioso — não bloqueia a lista de clientes
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function compartilhar(clienteId: number) {
    setLoading(true);
    try {
      await compartilhamentoService.compartilhar(clienteId);
      setClientesCompartilhados(prev => new Set([...prev, clienteId]));
      toast.success('Cliente compartilhado com todas as advogadas.');
    } catch {
      toast.error('Erro ao compartilhar cliente.');
    } finally {
      setLoading(false);
    }
  }

  async function remover(clienteId: number) {
    setLoading(true);
    try {
      await compartilhamentoService.remover(clienteId);
      setClientesCompartilhados(prev => { const s = new Set(prev); s.delete(clienteId); return s; });
      toast.success('Compartilhamento removido.');
    } catch {
      toast.error('Erro ao remover compartilhamento.');
    } finally {
      setLoading(false);
    }
  }

  return { clientesCompartilhados, loading, compartilhar, remover };
}
