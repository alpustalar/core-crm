import { z } from 'zod';

/////////////////////////////////////////
// PATIENT GROUP SCHEMA
/////////////////////////////////////////

export const PatientGroupSchema = z.object({
  id: z.string(),
  clinicId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type PatientGroup = z.infer<typeof PatientGroupSchema>

export default PatientGroupSchema;
