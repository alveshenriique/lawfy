import { api } from './api';
import type { Financeiro, CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../types/financeiro';

export const financeiroService = {
  getAll: () =>
    api.get<Financeiro[]>('/financeiro').then(r => r.data),

  getById: (id: number) =>
    api.get<Financeiro>(`/financeiro/${id}`).then(r => r.data),

  getByProcesso: (processoId: number) =>
    api.get<Financeiro[]>(`/financeiro?processo_id=${processoId}`).then(r => r.data),

  create: (data: CreateFinanceiroDTO) =>
    api.post<Financeiro>('/financeiro', data).then(r => r.data),

  update: (id: number, data: UpdateFinanceiroDTO) =>
    api.put<Financeiro>(`/financeiro/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/financeiro/${id}`),
};