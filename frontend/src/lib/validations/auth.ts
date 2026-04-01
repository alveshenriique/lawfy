import { z } from 'zod';

// Definimos o Schema de validação
export const loginSchema = z.object({
  email: z.string()
    .min(1, "O e-mail é obrigatório")
    .email("E-mail inválido"),
  password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

// EXTRAÍMOS o tipo diretamente do Schema. 
// Isso substitui a necessidade de escrever o 'LoginCredentials' manualmente.
export type LoginFormData = z.infer<typeof loginSchema>;