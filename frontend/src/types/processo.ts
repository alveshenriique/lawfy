export type ProcessoTipo = 'judicial' | 'extrajudicial';
export type ProcessoStatus = 'ativo' | 'arquivado' | 'encerrado';

export interface Processo {
  id: number;
  numero_processo: string | null;
  nome_partes: string;
  cliente_id: number;
  tipo: ProcessoTipo;
  status: ProcessoStatus;
  criado_em: string;
  user_id: string;
  clientes?: {
    nome: string;
  };
}

export interface CreateProcessoDTO {
  numero_processo?: string | null;
  nome_partes: string;
  cliente_id: number;
  tipo: ProcessoTipo;
  status: ProcessoStatus;
}

export type UpdateProcessoDTO = Partial<CreateProcessoDTO>;