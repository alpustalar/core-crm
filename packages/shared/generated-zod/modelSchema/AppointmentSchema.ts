import { z } from 'zod';
import { AppointmentStatusSchema } from '../inputTypeSchemas/AppointmentStatusSchema'
import { ExternalSystemSchema } from '../inputTypeSchemas/ExternalSystemSchema'

/////////////////////////////////////////
// APPOINTMENT SCHEMA
/////////////////////////////////////////

export const AppointmentSchema = z.object({
  status: AppointmentStatusSchema,
  externalSystem: ExternalSystemSchema.nullable(),
  id: z.uuid(),
  patientName: z.string(),
  patientPhone: z.string(),
  patientEmail: z.string().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  treatmentType: z.string().nullable(),
  notes: z.string().nullable(),
  canceledAt: z.coerce.date().nullable(),
  canceledBy: z.string().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  externalId: z.string().nullable(),
  treatmentId: z.string(),
  clinicId: z.string(),
  doctorId: z.string(),
  patientId: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date(),
})

export type Appointment = z.infer<typeof AppointmentSchema>

export default AppointmentSchema;
