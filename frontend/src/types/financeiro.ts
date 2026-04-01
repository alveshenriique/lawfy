export type FinanceiroTipo = 'receita' | 'despesa';
export type FinanceiroStatus = 'pendente' | 'pago' | 'cancelado';

export interface Financeiro {
  id: number;
  processo_id: number;
  tipo: FinanceiroTipo;
  valor_total: number;
  descricao: string;
  status: FinanceiroStatus;
  user_id: string;
}

export interface CreateFinanceiroDTO {
  processo_id: number;
  tipo: FinanceiroTipo;
  valor_total: number;
  descricao: string;
}

export type UpdateFinanceiroDTO = Partial<CreateFinanceiroDTO> & {
  status?: FinanceiroStatus;
};