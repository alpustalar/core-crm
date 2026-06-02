import { z } from 'zod';

export const PaxSaleSchema = z.object({
  posDeviceId: z.string().uuid(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('TRY'),
});
