import { z } from 'zod';

export const processoSchema = z.object({
  tipo: z.enum(['judicial', 'extrajudicial']),
  status: z.enum(['ativo', 'arquivado', 'encerrado']),
  numero_processo: z.string().optional().nullable(),
  nome_partes: z.string()
    .min(1, "O nome das partes é obrigatório")
    .min(3, "O nome das partes deve ter no mínimo 3 caracteres"),
  cliente_id: z.number({
    message: "Selecione um cliente",
  }).min(1, "Selecione um cliente"),
}).refine(data => {
  if (data.tipo === 'judicial' && !data.numero_processo) {
    return false;
  }
  return true;
}, {
  message: "O número do processo é obrigatório para processos judiciais",
  path: ["numero_processo"],
});

export type ProcessoFormData = z.infer<typeof processoSchema>;