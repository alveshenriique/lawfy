import { z } from 'zod';

export const processoSchema = z.object({
  body: z.object({
    numero_processo: z.string().min(5, "O número do processo deve ser válido").optional().nullable(),
    nome_partes: z.string().min(3, "Informe o nome das partes envolvidas"),
    cliente_id: z.number().int().positive("ID do cliente inválido"),
    tipo: z.enum(['judicial', 'extrajudicial']).default('extrajudicial'),
    status: z.enum(['ativo', 'arquivado', 'encerrado']).default('ativo'),
  })
});