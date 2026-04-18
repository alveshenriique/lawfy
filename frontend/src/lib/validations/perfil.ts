import { z } from 'zod';

export const nomeSchema = z.object({
  nome: z.string()
    .min(1, "O nome é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres"),
});

export const senhaSchema = z.object({
  senha_atual: z.string()
    .min(1, "A senha atual é obrigatória"),
  nova_senha: z.string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmar_senha: z.string()
    .min(1, "Confirme a nova senha"),
}).refine(data => data.nova_senha === data.confirmar_senha, {
  message: "As senhas não coincidem",
  path: ["confirmar_senha"],
});

export type NomeFormData = z.infer<typeof nomeSchema>;
export type SenhaFormData = z.infer<typeof senhaSchema>;