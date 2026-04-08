import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string()
    .min(1, "O nome é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres"),
  cpf_cnpj: z.string()
    .min(1, "O CPF/CNPJ é obrigatório")
    .min(11, "CPF/CNPJ inválido"),
  telefone: z.string()
    .min(10, "Telefone inválido")
    .optional()
    .or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().max(2).optional().or(z.literal('')),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;