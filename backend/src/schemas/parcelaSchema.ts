import { z } from 'zod';

export const editarParcelaSchema = z.object({
  body: z.object({
    valor_parcela: z.number().positive("O valor deve ser maior que zero"),
    data_vencimento: z.string().min(1, "Informe a data de vencimento"),
    // Quando true, as parcelas seguintes (não pagas, com vencimento posterior)
    // têm o vencimento recalculado mês a mês a partir desta parcela.
    recalcular_seguintes: z.boolean().optional(),
  })
});

export const quitarParcelaSchema = z.object({
  body: z.object({
    pago: z.boolean({ message: "Informe o status de pagamento" }),
  })
});
