import { z } from 'zod';

export const GetWhatsappUsageSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
