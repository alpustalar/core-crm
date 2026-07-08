import { z } from 'zod';

/////////////////////////////////////////
// PROVIDER SPECIALTY SCHEMA
/////////////////////////////////////////

export const ProviderSpecialtySchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  slug: z.string(),
})

export type ProviderSpecialty = z.infer<typeof ProviderSpecialtySchema>

export default ProviderSpecialtySchema;
