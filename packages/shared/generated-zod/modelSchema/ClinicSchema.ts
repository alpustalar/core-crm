import { z } from 'zod';
import { GlobalStatusSchema } from '../inputTypeSchemas/GlobalStatusSchema'

/////////////////////////////////////////
// CLINIC SCHEMA
/////////////////////////////////////////

export const ClinicSchema = z.object({
  status: GlobalStatusSchema,
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  sectorId: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  consultationSlotDuration: z.number().int(),
  healthFacilityCode: z.string().nullable(),
  iyzicoSubMerchantKey: z.string().nullable(),
  timezone: z.string(),
  logo: z.string().nullable(),
  organizationId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Clinic = z.infer<typeof ClinicSchema>

export default ClinicSchema;
