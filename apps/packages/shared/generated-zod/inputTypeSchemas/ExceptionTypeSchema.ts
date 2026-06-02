import { z } from 'zod';

export const ExceptionTypeSchema = z.enum(['OFF','ON']);

export type ExceptionTypeType = `${z.infer<typeof ExceptionTypeSchema>}`

export default ExceptionTypeSchema;
