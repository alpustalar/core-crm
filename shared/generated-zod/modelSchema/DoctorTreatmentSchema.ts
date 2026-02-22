import { z } from 'zod';
import { Prisma } from '@prisma/client'

/////////////////////////////////////////
// DOCTOR TREATMENT SCHEMA
/////////////////////////////////////////

export const DoctorTreatmentSchema = z.object({
  id: z.uuid(),
  customPrice: z.instanceof(Prisma.Decimal, { message: "Field 'customPrice' must be a Decimal. Location: ['Models', 'DoctorTreatment']"}).nullable(),
  customDuration: z.number().int().nullable(),
  isActive: z.boolean(),
  updatedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date().nullable(),
  doctorId: z.string(),
  treatmentId: z.string(),
})

export type DoctorTreatment = z.infer<typeof DoctorTreatmentSchema>

export default DoctorTreatmentSchema;
