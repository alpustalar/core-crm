import { z } from 'zod';

export const EDocumentTypeSchema = z.enum(['E_FATURA','E_ARSIV','E_SMM','INTERNAL']);

export type EDocumentTypeType = `${z.infer<typeof EDocumentTypeSchema>}`

export default EDocumentTypeSchema;
