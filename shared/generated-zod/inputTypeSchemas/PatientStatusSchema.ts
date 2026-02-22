import { z } from 'zod';

export const PatientStatusSchema = z.enum(['ACTIVE','INACTIVE','ARCHIVED','DECEASED','BLACKLISTED']);

export type PatientStatusType = `${z.infer<typeof PatientStatusSchema>}`

export default PatientStatusSchema;
