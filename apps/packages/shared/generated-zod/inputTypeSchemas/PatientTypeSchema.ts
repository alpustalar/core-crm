import { z } from 'zod';

export const PatientTypeSchema = z.enum(['ACTIVE','PASSIVE','POTENTIAL']);

export type PatientTypeType = `${z.infer<typeof PatientTypeSchema>}`

export default PatientTypeSchema;
