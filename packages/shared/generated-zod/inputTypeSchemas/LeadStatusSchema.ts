import { z } from 'zod';

export const LeadStatusSchema = z.enum(['NEW','CONTACTED','QUALIFIED','CONVERTED','LOST']);

export type LeadStatusType = `${z.infer<typeof LeadStatusSchema>}`

export default LeadStatusSchema;
