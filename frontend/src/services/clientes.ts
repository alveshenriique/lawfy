import { api } from './api';
import type { Cliente, CreateClienteDTO, UpdateClienteDTO } from '../types/cliente';

export const clientesService = {
  getAll: () =>
    api.get<Cliente[]>('/clientes').then(r => r.data),

  getById: (id: number) =>
    api.get<Cliente>(`/clientes/${id}`).then(r => r.data),

  create: (data: CreateClienteDTO) =>
    api.post<Cliente>('/clientes', data).then(r => r.data),

  update: (id: number, data: UpdateClienteDTO) =>
    api.put<Cliente>(`/clientes/${id}`, data).then(r => r.data),

  remove: (id: number) =>
    api.delete(`/clientes/${id}`),
};