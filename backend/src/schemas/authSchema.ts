import { z } from 'zod';

export const authSchema = z.object({
  body: z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").optional(),
    email: z.string().email("Formato de e-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
  })
});