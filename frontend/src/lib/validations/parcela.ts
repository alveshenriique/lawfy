import { z } from 'zod';

export const parcelaSchema = z.object({
  valor_parcela: z.number({
    message: "Informe o valor da parcela",
  }).positive("O valor deve ser maior que zero"),
  data_vencimento: z.string()
    .min(1, "Informe a data de vencimento"),
  data_pagamento: z.string().optional(),
});

export type ParcelaFormData = z.infer<typeof parcelaSchema>;