import { z } from 'zod';
import PaymentMethodSchema from '../../../generated-zod/inputTypeSchemas/PaymentMethodSchema';

export const CreatePaymentSchema = z.object({
  clinicId: z.string().uuid({ message: 'Geçersiz klinik ID formatı' }),
  patientId: z.string().uuid({ message: 'Geçersiz hasta ID formatı' }),
  appointmentId: z.string().uuid({ message: 'Geçersiz randevu ID formatı' }).optional(),
  providerId: z.string().uuid({ message: 'Geçersiz sağlayıcı ID formatı' }).optional(),
  amount: z
    .number({ message: 'Tutar sayısal bir değer olmalıdır' })
    .positive({ message: 'Tutar sıfırdan büyük olmalıdır' }),
  currency: z.string().default('TRY'),
  method: PaymentMethodSchema.default('CREDIT_CARD').optional(),
  dueDate: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
});
