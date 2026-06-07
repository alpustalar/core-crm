import { z } from 'zod';

export const OperationModeSchema = z.enum(['STATIC','SHIFT']);

export type OperationModeType = `${z.infer<typeof OperationModeSchema>}`

export default OperationModeSchema;
