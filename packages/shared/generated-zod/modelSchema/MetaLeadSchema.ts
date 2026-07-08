import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { MetaLeadStatusSchema } from '../inputTypeSchemas/MetaLeadStatusSchema'

/////////////////////////////////////////
// META LEAD SCHEMA
/////////////////////////////////////////

export const MetaLeadSchema = z.object({
  status: MetaLeadStatusSchema,
  id: z.string(),
  metaAdAccountId: z.string(),
  metaLeadId: z.string(),
  formId: z.string().nullable(),
  campaignId: z.string().nullable(),
  matchedPatientId: z.string().nullable(),
  matchedAppointmentId: z.string().nullable(),
  adsetId: z.string().nullable(),
  adId: z.string().nullable(),
  campaignName: z.string().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  rawData: JsonValueSchema.nullable(),
  matchedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MetaLead = z.infer<typeof MetaLeadSchema>

export default MetaLeadSchema;
