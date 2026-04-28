import { api } from './api';

export interface ParcelaVencendo {
  id: number;
  valor_parcela: number;
  data_vencimento: string;
  financeiro: {
    tipo: string;
    descricao: string;
    processos: {
      nome_partes: string;
      clientes: {
        nome: string;
      };
    };
  };
}

export interface FinanceiroMensal {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface DashboardResumo {
  totalClientes: number;
  processosAtivos: number;
  processosEncerrados: number;
  processosArquivados: number;
  totalProcessos: number;
  valorAReceber: number;
  parcelasVencendo: ParcelaVencendo[];
  totalParcelasVencendo: number;
  financeiroPorMes: FinanceiroMensal[];
}

export const dashboardService = {
  getResumo: () =>
    api.get<DashboardResumo>('/dashboard').then(r => r.data),
};
