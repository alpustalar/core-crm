import { z } from 'zod';

/////////////////////////////////////////
// APPOINTMENT DIAGNOSIS SCHEMA
/////////////////////////////////////////

export const AppointmentDiagnosisSchema = z.object({
  id: z.uuid(),
  appointmentId: z.string(),
  icd10Code: z.string(),
  description: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.coerce.date(),
})

export type AppointmentDiagnosis = z.infer<typeof AppointmentDiagnosisSchema>

export default AppointmentDiagnosisSchema;
