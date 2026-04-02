export type FinanceiroTipo = 'receita' | 'despesa';
export type FinanceiroStatus = 'pendente' | 'pago' | 'cancelado';

export interface Parcela {
  id: number;
  financeiro_id: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento: string | null;
  pago: boolean;
  user_id: string;
}

export interface Financeiro {
  id: number;
  processo_id: number;
  tipo: FinanceiroTipo;
  valor_total: number;
  descricao: string;
  status: FinanceiroStatus;
  user_id: string;
  parcelas?: Parcela[];
}

export interface CreateFinanceiroDTO {
  processo_id: number;
  tipo: FinanceiroTipo;
  valor_total: number;
  descricao: string;
  numero_parcelas: number;
}

export type UpdateFinanceiroDTO = Partial<CreateFinanceiroDTO> & {
  status?: FinanceiroStatus;
};