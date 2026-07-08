import { z } from 'zod';

export const LeadMediumSchema = z.enum(['ORGANIC','AD','FORM']);

export type LeadMediumType = `${z.infer<typeof LeadMediumSchema>}`

export default LeadMediumSchema;
