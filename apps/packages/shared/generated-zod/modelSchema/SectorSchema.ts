import { z } from 'zod';
import { SectorTypeSchema } from '../inputTypeSchemas/SectorTypeSchema'

/////////////////////////////////////////
// SECTOR SCHEMA
/////////////////////////////////////////

export const SectorSchema = z.object({
  name: SectorTypeSchema,
  id: z.uuid(),
  slug: z.string(),
})

export type Sector = z.infer<typeof SectorSchema>

export default SectorSchema;
