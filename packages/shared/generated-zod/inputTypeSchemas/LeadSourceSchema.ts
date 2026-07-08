import { z } from 'zod';

export const LeadSourceSchema = z.enum(['WHATSAPP','INSTAGRAM','MESSENGER','TELEGRAM','META_FORM','GOOGLE_ADS','WEBSITE','MANUAL']);

export type LeadSourceType = `${z.infer<typeof LeadSourceSchema>}`

export default LeadSourceSchema;
