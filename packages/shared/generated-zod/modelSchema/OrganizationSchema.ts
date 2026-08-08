import { z } from 'zod';
import { GlobalStatusSchema } from '../inputTypeSchemas/GlobalStatusSchema'
import { TimeZoneSchema } from '../inputTypeSchemas/TimeZoneSchema'

/////////////////////////////////////////
// ORGANIZATION SCHEMA
/////////////////////////////////////////

export const OrganizationSchema = z.object({
  status: GlobalStatusSchema,
  timezone: TimeZoneSchema,
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  /**
   * Platformun (bizim) kendi kiracı satırı. Sağlık turizmi komisyonu klinik
   * değil platform geliridir; defter clinicId zorunlu olduğu için platform da
   * bir kiracı olarak modellenir ve kendi defterini tutar. Kiracıya dönük
   * listeler/raporlar bu bayrakla dışlar. Sistemde en fazla bir tane olur.
   */
  isPlatform: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Organization = z.infer<typeof OrganizationSchema>

export default OrganizationSchema;
