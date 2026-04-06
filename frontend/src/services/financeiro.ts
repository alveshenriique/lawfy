import { api } from './api';
import type { Financeiro, Parcela } from '../types/financeiro';
import type { FinanceiroFormData } from '../lib/validations/financeiro';

export const financeiroService = {
  getAll: () =>
    api.get<Financeiro[]>('/financeiro').then(r => r.data),

  getById: (id: number) =>
    api.get<Financeiro>(`/financeiro/${id}`).then(r => r.data),

  getByProcesso: (processoId: number) =>
    api.get<Financeiro[]>(`/financeiro?processo_id=${processoId}`).then(r => r.data),

  create: (data: FinanceiroFormData) =>
    api.post<Financeiro>('/financeiro', data).then(r => r.data),

  update: (id: number, data: Partial<FinanceiroFormData>) =>
    api.put<Financeiro>(`/financeiro/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/financeiro/${id}`),

  quitarParcela: (id: number) =>
    api.put(`/financeiro/parcelas/${id}`).then(r => r.data),

  editarParcela: (id: number, data: { valor_parcela: number; data_vencimento: string }) =>
    api.patch<Parcela>(`/financeiro/parcelas/${id}`, data).then(r => r.data),
};