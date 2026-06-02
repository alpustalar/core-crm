import { z } from 'zod';

export const ExternalSystemSchema = z.enum(['WHATSAPP','N8N','GOOGLE_CALENDAR']);

export type ExternalSystemType = `${z.infer<typeof ExternalSystemSchema>}`

export default ExternalSystemSchema;
