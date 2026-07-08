import { z } from 'zod';
import { LeadSourceSchema } from '../inputTypeSchemas/LeadSourceSchema'
import { LeadStatusSchema } from '../inputTypeSchemas/LeadStatusSchema'
import { LeadMediumSchema } from '../inputTypeSchemas/LeadMediumSchema'

/////////////////////////////////////////
// LEAD SCHEMA
/////////////////////////////////////////

export const LeadSchema = z.object({
  source: LeadSourceSchema,
  status: LeadStatusSchema,
  medium: LeadMediumSchema.nullable(),
  id: z.string(),
  clinicId: z.string(),
  assignedToId: z.string().nullable(),
  patientId: z.string().nullable(),
  appointmentId: z.string().nullable(),
  metaLeadId: z.string().nullable(),
  campaignId: z.string().nullable(),
  adId: z.string().nullable(),
  adsetId: z.string().nullable(),
  ctwaClid: z.string().nullable(),
  whatsAppConversationId: z.string().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  notes: z.string().nullable(),
  convertedAt: z.coerce.date().nullable(),
  lostReason: z.string().nullable(),
  lostAt: z.coerce.date().nullable(),
  campaignName: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Lead = z.infer<typeof LeadSchema>

export default LeadSchema;
