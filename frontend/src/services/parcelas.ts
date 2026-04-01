import { api } from './api';
import type { Parcela, UpdateParcelaDTO } from '../types/parcela';

export const parcelasService = {
  getByFinanceiro: (financeiroId: number) =>
    api.get<Parcela[]>(`/parcelas?financeiro_id=${financeiroId}`).then(r => r.data),

  marcarPago: (id: number, data: UpdateParcelaDTO) =>
    api.patch<Parcela>(`/parcelas/${id}`, data).then(r => r.data),
};