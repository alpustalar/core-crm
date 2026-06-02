import { z } from 'zod';

export const CancelPaymentSchema = z.object({
  paymentId: z.uuid({ message: 'Geçersiz ödeme ID formatı' }),
});
