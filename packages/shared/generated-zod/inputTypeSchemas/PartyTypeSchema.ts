import { z } from 'zod';

export const PartyTypeSchema = z.enum(['INDIVIDUAL','COMPANY']);

export type PartyTypeType = `${z.infer<typeof PartyTypeSchema>}`

export default PartyTypeSchema;
