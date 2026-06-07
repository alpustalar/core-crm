import { z } from 'zod';

export const PatientPackageStatusSchema = z.enum(['ACTIVE','COMPLETED','CANCELLED','SUSPENDED']);

export type PatientPackageStatusType = `${z.infer<typeof PatientPackageStatusSchema>}`

export default PatientPackageStatusSchema;
