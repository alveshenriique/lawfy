import { api } from './api';
import type { Processo, CreateProcessoDTO, UpdateProcessoDTO } from '../types/processo';

export const processosService = {
  getAll: () =>
    api.get<Processo[]>('/processos').then(r => r.data),

  getById: (id: number) =>
    api.get<Processo>(`/processos/${id}`).then(r => r.data),

  getByCliente: (clienteId: number) =>
    api.get<Processo[]>(`/processos?cliente_id=${clienteId}`).then(r => r.data),

  create: (data: CreateProcessoDTO) =>
    api.post<Processo>('/processos', data).then(r => r.data),

  update: (id: number, data: UpdateProcessoDTO) =>
    api.put<Processo>(`/processos/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/processos/${id}`),
};