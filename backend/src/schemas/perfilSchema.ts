import { z } from 'zod';

export const atualizarNomeSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  }),
});

export const atualizarSenhaSchema = z.object({
  body: z.object({
    senha_atual: z.string().min(1, 'A senha atual é obrigatória'),
    nova_senha: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  }),
});
