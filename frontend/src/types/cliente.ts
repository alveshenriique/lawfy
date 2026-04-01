export interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone?: string;
  criado_em: string;
  user_id: string;
}

export interface CreateClienteDTO {
  nome: string;
  cpf_cnpj: string;
  telefone?: string;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;