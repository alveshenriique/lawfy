import { z } from 'zod';

export const compartilharSchema = z.object({
  body: z.object({
    email: z.string().email('Informe um e-mail válido'),
  }),
});
