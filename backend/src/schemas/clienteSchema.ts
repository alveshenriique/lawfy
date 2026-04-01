import { z } from 'zod';

export const clienteSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    cpf_cnpj: z.string().min(11, "Documento inválido").max(14, "Documento inválido"),
    telefone: z.string().optional(),
  })
});