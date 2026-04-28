import { z } from 'zod';

export const SectorTypeSchema = z.enum(['ALL','DENTAL','HAIR_TRANSPLANT','AESTHETICS']);

export type SectorTypeType = `${z.infer<typeof SectorTypeSchema>}`

export default SectorTypeSchema;
