import { z } from 'zod';
import PaymentMethodSchema from '../../../../generated-zod/inputTypeSchemas/PaymentMethodSchema';

export const AssignPackageToPatientSchema = z.object({
  patientId: z.uuid(),
  packageId: z.uuid(),
  providerId: z.uuid(),
  startDate: z.coerce.date(),
  method: PaymentMethodSchema,
  notes: z.string().optional(),
});
