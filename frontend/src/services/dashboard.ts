import { api } from './api';

export interface DashboardResumo {
  totalClientes: number;
  processosAtivos: number;
  totalProcessos: number;
  valorAReceber: number;
  parcelasVencendo: number;
}

export const dashboardService = {
  getResumo: () =>
    api.get<DashboardResumo>('/dashboard').then(r => r.data),
};