export interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  criado_em: string;
  user_id: string;
}

export interface CreateClienteDTO {
  nome: string;
  cpf_cnpj: string;
  telefone?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;