import { z } from 'zod';
import { GenderSchema } from '../inputTypeSchemas/GenderSchema'
import { BloodTypeSchema } from '../inputTypeSchemas/BloodTypeSchema'
import { PatientStatusSchema } from '../inputTypeSchemas/PatientStatusSchema'
import { PatientTypeSchema } from '../inputTypeSchemas/PatientTypeSchema'

/////////////////////////////////////////
// PATIENT SCHEMA
/////////////////////////////////////////

export const PatientSchema = z.object({
  gender: GenderSchema.nullable(),
  bloodType: BloodTypeSchema.nullable(),
  status: PatientStatusSchema,
  patientType: PatientTypeSchema.nullable(),
  id: z.string(),
  firebaseUid: z.string().nullable(),
  organizationId: z.string(),
  clinicId: z.string().nullable(),
  sectorId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  tcNo: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
  phone: z.string().nullable(),
  alternativePhone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  companionName: z.string().nullable(),
  companionPhone: z.string().nullable(),
  profilePhoto: z.string().nullable(),
  protocolNo: z.string().nullable(),
  allergies: z.string().nullable(),
  chronicDiseases: z.string().nullable(),
  responsibleProviderId: z.string().nullable(),
  checkupDate: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Patient = z.infer<typeof PatientSchema>

export default PatientSchema;
