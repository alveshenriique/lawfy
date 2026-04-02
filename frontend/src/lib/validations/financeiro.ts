import { z } from 'zod';

export const financeiroSchema = z.object({
  processo_id: z.number({
    message: "Selecione um processo",
  }).min(1, "Selecione um processo"),
  tipo: z.enum(['receita', 'despesa']),
  valor_total: z.number({
    message: "Informe o valor total",
  }).positive("O valor deve ser maior que zero"),
  descricao: z.string()
    .min(5, "A descrição deve ter pelo menos 5 caracteres"),
  numero_parcelas: z.number({
    message: "Informe o número de parcelas",
  }).int().min(1, "Mínimo de 1 parcela").max(60, "Máximo de 60 parcelas"),
});

export type FinanceiroFormData = z.infer<typeof financeiroSchema>;