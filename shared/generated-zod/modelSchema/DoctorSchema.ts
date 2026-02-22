import { z } from 'zod';
import { DoctorTitleSchema } from '../inputTypeSchemas/DoctorTitleSchema'
import { DoctorSpecialtySchema } from '../inputTypeSchemas/DoctorSpecialtySchema'

/////////////////////////////////////////
// DOCTOR SCHEMA
/////////////////////////////////////////

export const DoctorSchema = z.object({
  title: DoctorTitleSchema.nullable(),
  specialty: DoctorSpecialtySchema,
  id: z.uuid(),
  publicPhone: z.string().nullable(),
  publicEmail: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  clinicId: z.string(),
  userId: z.string(),
})

export type Doctor = z.infer<typeof DoctorSchema>

export default DoctorSchema;
