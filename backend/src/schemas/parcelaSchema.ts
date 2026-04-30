import { z } from 'zod';

export const editarParcelaSchema = z.object({
  body: z.object({
    valor_parcela: z.number().positive("O valor deve ser maior que zero"),
    data_vencimento: z.string().min(1, "Informe a data de vencimento"),
  })
});

export const quitarParcelaSchema = z.object({
  body: z.object({
    pago: z.boolean({ message: "Informe o status de pagamento" }),
  })
});
