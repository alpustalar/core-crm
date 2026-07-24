import { z } from 'zod';
import { ActivityTypeSchema } from '../inputTypeSchemas/ActivityTypeSchema'
import { ActivityStatusSchema } from '../inputTypeSchemas/ActivityStatusSchema'

/////////////////////////////////////////
// ACTIVITY SCHEMA
/////////////////////////////////////////

/**
 * Lead (ve dönüşüm sonrası opsiyonel Patient) üzerine kaydedilen satış aktivitesi:
 * arama, not, görev, toplantı. Görevler assignedTo + dueAt taşır ve tamamlanır.
 */
export const ActivitySchema = z.object({
  type: ActivityTypeSchema,
  status: ActivityStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  organizationId: z.string(),
  leadId: z.string().nullable(),
  patientId: z.string().nullable(),
  subject: z.string(),
  notes: z.string().nullable(),
  assignedToId: z.string().nullable(),
  createdById: z.string().nullable(),
  dueAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Activity = z.infer<typeof ActivitySchema>

export default ActivitySchema;
