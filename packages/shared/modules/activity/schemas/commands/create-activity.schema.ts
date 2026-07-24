import { z } from 'zod';
import ActivityTypeSchema from '@shared/generated-zod/inputTypeSchemas/ActivityTypeSchema';

/**
 * Lead/Patient üzerine satış aktivitesi oluşturma.
 */
export const CreateActivitySchema = z.object({
  leadId: z.uuid().nullable().optional(),
  patientId: z.uuid().nullable().optional(),
  type: ActivityTypeSchema,
  subject: z.string().min(1),
  notes: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
  dueAt: z.coerce.date().nullable().optional(),
  clinicId: z.uuid()
});
