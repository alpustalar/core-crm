import { z } from 'zod';
import { GlobalStatusSchema } from '../inputTypeSchemas/GlobalStatusSchema'
import { TimeZoneSchema } from '../inputTypeSchemas/TimeZoneSchema'

/////////////////////////////////////////
// CLINIC SCHEMA
/////////////////////////////////////////

export const ClinicSchema = z.object({
  status: GlobalStatusSchema,
  timezone: TimeZoneSchema,
  id: z.string(),
  organizationId: z.string(),
  sectorId: z.string(),
  name: z.string(),
  slug: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  consultationSlotDuration: z.number().int(),
  logo: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Clinic = z.infer<typeof ClinicSchema>

export default ClinicSchema;
