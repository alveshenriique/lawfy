import { api } from './api';
import type { Financeiro } from '../types/financeiro';
import type { FinanceiroFormData } from '../lib/validations/financeiro';

export const financeiroService = {
  getAll: () =>
    api.get<Financeiro[]>('/financeiro').then(r => r.data),

  getById: (id: number) =>
    api.get<Financeiro>(`/financeiro/${id}`).then(r => r.data),

  getByProcesso: (processoId: number) =>
    api.get<Financeiro[]>(`/financeiro?processo_id=${processoId}`).then(r => r.data),

  create: (data: FinanceiroFormData) =>
    api.post<Financeiro>('/financeiro/gerar', data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/financeiro/${id}`),

  quitarParcela: (id: number) =>
    api.patch(`/parcelas/${id}/quitar`).then(r => r.data),
};