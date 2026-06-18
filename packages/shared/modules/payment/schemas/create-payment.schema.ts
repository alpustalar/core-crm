import { z } from 'zod';
import PaymentMethodSchema from '../../../generated-zod/inputTypeSchemas/PaymentMethodSchema';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

export const CreatePaymentSchema = z.object({
  clinicId: z.uuid({ message: 'Geçersiz klinik ID formatı' }),
  patientId: z.uuid({ message: 'Geçersiz hasta ID formatı' }),
  appointmentId: z.uuid({ message: 'Geçersiz randevu ID formatı' }).optional(),
  providerId: z.uuid({ message: 'Geçersiz sağlayıcı ID formatı' }).optional(),
  amount: z
    .number({ message: 'Tutar sayısal bir değer olmalıdır' })
    .positive({ message: 'Tutar sıfırdan büyük olmalıdır' }),
  currency: CurrencySchema,
  method: PaymentMethodSchema.default('CREDIT_CARD').optional(),
  dueDate: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
});
