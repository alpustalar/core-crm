import { z } from 'zod';

export const EDocumentStatusSchema = z.enum(['DRAFT','QUEUED','SENT','ACCEPTED','REJECTED','INTERNAL','FAILED']);

export type EDocumentStatusType = `${z.infer<typeof EDocumentStatusSchema>}`

export default EDocumentStatusSchema;
