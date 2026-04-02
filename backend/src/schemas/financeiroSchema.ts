import { z } from 'zod';

export const financeiroSchema = z.object({
  body: z.object({
    processo_id: z.number().int().positive("ID do processo deve ser um número positivo"),
    tipo: z.enum(['receita', 'despesa']),
    valor_total: z.number().positive("O valor deve ser maior que zero"),
    descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
    numero_parcelas: z.number().int().min(1, "O número de parcelas deve ser no mínimo 1")
  })
});