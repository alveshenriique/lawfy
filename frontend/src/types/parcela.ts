export interface Parcela {
  id: number;
  financeiro_id: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento: string | null;
  pago: boolean;
  user_id: string;
}

export interface UpdateParcelaDTO {
  pago: boolean;
  data_pagamento?: string;
}