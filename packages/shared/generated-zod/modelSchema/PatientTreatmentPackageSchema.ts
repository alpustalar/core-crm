import { z } from 'zod';
import { PatientPackageStatusSchema } from '../inputTypeSchemas/PatientPackageStatusSchema'

/////////////////////////////////////////
// PATIENT TREATMENT PACKAGE SCHEMA
/////////////////////////////////////////

export const PatientTreatmentPackageSchema = z.object({
  status: PatientPackageStatusSchema,
  id: z.string(),
  patientId: z.string(),
  packageId: z.string(),
  providerId: z.string(),
  paymentId: z.string().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().nullable(),
  usedExaminationCount: z.number().int(),
  usedControlCount: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PatientTreatmentPackage = z.infer<typeof PatientTreatmentPackageSchema>

export default PatientTreatmentPackageSchema;
