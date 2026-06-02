import { z } from 'zod';

export const RefundPaymentSchema = z.object({
  paymentId: z.uuid({ message: 'Geçersiz ödeme ID formatı' }),
});
