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
});

export type ClienteFormData = z.infer<typeof clienteSchema>;