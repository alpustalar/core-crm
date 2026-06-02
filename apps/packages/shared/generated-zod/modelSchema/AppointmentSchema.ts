import { z } from 'zod';
import { AppointmentStatusSchema } from '../inputTypeSchemas/AppointmentStatusSchema'
import { ExaminationTypeSchema } from '../inputTypeSchemas/ExaminationTypeSchema'
import { VisitTypeSchema } from '../inputTypeSchemas/VisitTypeSchema'
import { ExternalSystemSchema } from '../inputTypeSchemas/ExternalSystemSchema'

/////////////////////////////////////////
// APPOINTMENT SCHEMA
/////////////////////////////////////////

export const AppointmentSchema = z.object({
  status: AppointmentStatusSchema,
  examinationType: ExaminationTypeSchema.nullable(),
  visitType: VisitTypeSchema.nullable(),
  externalSystem: ExternalSystemSchema.nullable(),
  id: z.uuid(),
  patientName: z.string(),
  patientPhone: z.string(),
  patientEmail: z.string().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  timezone: z.string(),
  treatmentType: z.string().nullable(),
  notes: z.string().nullable(),
  canceledAt: z.coerce.date().nullable(),
  canceledBy: z.string().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  externalId: z.string().nullable(),
  treatmentId: z.string().nullable(),
  clinicId: z.string(),
  providerId: z.string(),
  patientId: z.string().nullable(),
  resourceId: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
})

export type Appointment = z.infer<typeof AppointmentSchema>

export default AppointmentSchema;
