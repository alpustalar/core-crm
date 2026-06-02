import { z } from 'zod';

export const ClinicOperationModeSchema = z.enum(['STATIC','SHIFT']);

export type ClinicOperationModeType = `${z.infer<typeof ClinicOperationModeSchema>}`

export default ClinicOperationModeSchema;
