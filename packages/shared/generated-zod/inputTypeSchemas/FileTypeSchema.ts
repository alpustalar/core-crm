import { z } from 'zod';

export const FileTypeSchema = z.enum(['XRAY','PRESCRIPTION','PHOTO','CONSENT_FORM','LAB_RESULT','OTHER']);

export type FileTypeType = `${z.infer<typeof FileTypeSchema>}`

export default FileTypeSchema;
