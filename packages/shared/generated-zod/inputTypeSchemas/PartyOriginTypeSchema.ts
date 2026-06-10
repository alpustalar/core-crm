import { z } from 'zod';

export const PartyOriginTypeSchema = z.enum(['PATIENT','SUPPLIER','USER','EXTERNAL']);

export type PartyOriginTypeType = `${z.infer<typeof PartyOriginTypeSchema>}`

export default PartyOriginTypeSchema;
