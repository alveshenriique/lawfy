import { z } from 'zod';

export const clienteSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    cpf_cnpj: z.string().min(11, "Documento inválido").max(14, "Documento inválido"),
    telefone: z.string().nullable().optional(),
    cep: z.string().nullable().optional(),
    logradouro: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    cidade: z.string().nullable().optional(),
    estado: z.string().max(2).nullable().optional(),
  })
});