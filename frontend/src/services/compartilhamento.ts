import { api } from './api';

export const compartilhamentoService = {
  meusCompartilhados(): Promise<number[]> {
    return api.get('/compartilhamento').then(r => r.data);
  },
  compartilhar(clienteId: number): Promise<void> {
    return api.post(`/clientes/${clienteId}/compartilhamento`).then(r => r.data);
  },
  remover(clienteId: number): Promise<void> {
    return api.delete(`/clientes/${clienteId}/compartilhamento`).then(r => r.data);
  },
};
