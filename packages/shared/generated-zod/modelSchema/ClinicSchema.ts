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
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  timezone: z.string(),
  logo: z.string().nullable(),
  organizationId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Clinic = z.infer<typeof ClinicSchema>

export default ClinicSchema;
