import { z } from 'zod';

export const LeadSourceSchema = z.enum(['WHATSAPP','MANUAL']);

export type LeadSourceType = `${z.infer<typeof LeadSourceSchema>}`

export default LeadSourceSchema;
