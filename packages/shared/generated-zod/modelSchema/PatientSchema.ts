import { z } from 'zod';
import { GenderSchema } from '../inputTypeSchemas/GenderSchema'
import { BloodTypeSchema } from '../inputTypeSchemas/BloodTypeSchema'
import { PatientStatusSchema } from '../inputTypeSchemas/PatientStatusSchema'

/////////////////////////////////////////
// PATIENT SCHEMA
/////////////////////////////////////////

export const PatientSchema = z.object({
  gender: GenderSchema,
  bloodType: BloodTypeSchema.nullable(),
  status: PatientStatusSchema,
  id: z.uuid(),
  clinicId: z.string().nullable(),
  sectorId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  tcNo: z.string().nullable(),
  birthDate: z.coerce.date().nullable(),
  phone: z.string(),
  alternativePhone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  allergies: z.string().nullable(),
  chronicDiseases: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Patient = z.infer<typeof PatientSchema>

export default PatientSchema;
