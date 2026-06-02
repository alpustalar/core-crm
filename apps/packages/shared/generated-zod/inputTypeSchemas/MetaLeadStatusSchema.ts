import { z } from 'zod';

export const MetaLeadStatusSchema = z.enum(['NEW','MATCHED','CONVERTED','INVALID']);

export type MetaLeadStatusType = `${z.infer<typeof MetaLeadStatusSchema>}`

export default MetaLeadStatusSchema;
