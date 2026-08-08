import { z } from 'zod';
import ExternalWorkOrderStatusSchema from '@shared/generated-zod/inputTypeSchemas/ExternalWorkOrderStatusSchema';

export const GetWorkOrdersSchema = z.object({
  status: ExternalWorkOrderStatusSchema.optional(),
  supplierId: z.uuid().optional(),
  patientId: z.uuid().optional(),
  /** Yalnız termini geçmiş (ve henüz teslim alınmamış) iş emirleri. */
  overdue: z.stringbool().optional(),
  dueBefore: z.coerce.date().optional(),
});
