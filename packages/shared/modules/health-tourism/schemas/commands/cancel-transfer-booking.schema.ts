import { z } from 'zod';

export const CancelTransferBookingSchema = z.object({
  reference: z.string().min(1),
  language: z.string().default('en'),
});
