import { z } from 'zod';
import { LeadSourceSchema } from '../inputTypeSchemas/LeadSourceSchema'
import { LeadStatusSchema } from '../inputTypeSchemas/LeadStatusSchema'

/////////////////////////////////////////
// LEAD SCHEMA
/////////////////////////////////////////

export const LeadSchema = z.object({
  source: LeadSourceSchema,
  status: LeadStatusSchema,
  id: z.uuid(),
  clinicId: z.string(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  assignedToId: z.string().nullable(),
  patientId: z.string().nullable(),
  appointmentId: z.string().nullable(),
  convertedAt: z.coerce.date().nullable(),
  lostReason: z.string().nullable(),
  lostAt: z.coerce.date().nullable(),
  whatsAppConversationId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Lead = z.infer<typeof LeadSchema>

export default LeadSchema;
