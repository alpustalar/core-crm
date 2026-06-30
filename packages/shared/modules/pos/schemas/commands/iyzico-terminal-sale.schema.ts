import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

export const IyzicoTerminalSaleSchema = z.object({
  posDeviceId: z.uuid(),
  clinicId: z.uuid(),
  patientId: z.uuid().optional(),
  appointmentId: z.uuid().optional(),
  paymentId: z.uuid().optional(),
  amount: z.number().positive(),
  currency: CurrencySchema,
  // 0 = tek çekim, >0 = taksit
  installment: z.number().int().nonnegative().optional(),
});
