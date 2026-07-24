import { z } from 'zod';
import { AppointmentSourceSchema } from '../inputTypeSchemas/AppointmentSourceSchema'
import { TimeZoneSchema } from '../inputTypeSchemas/TimeZoneSchema'
import { AppointmentCreatorTypeSchema } from '../inputTypeSchemas/AppointmentCreatorTypeSchema'
import { AppointmentStatusSchema } from '../inputTypeSchemas/AppointmentStatusSchema'
import { ExaminationTypeSchema } from '../inputTypeSchemas/ExaminationTypeSchema'
import { VisitTypeSchema } from '../inputTypeSchemas/VisitTypeSchema'
import { ExternalSystemSchema } from '../inputTypeSchemas/ExternalSystemSchema'

/////////////////////////////////////////
// APPOINTMENT SCHEMA
/////////////////////////////////////////

export const AppointmentSchema = z.object({
  source: AppointmentSourceSchema,
  timezone: TimeZoneSchema,
  creatorType: AppointmentCreatorTypeSchema,
  status: AppointmentStatusSchema,
  examinationType: ExaminationTypeSchema.nullable(),
  visitType: VisitTypeSchema.nullable(),
  externalSystem: ExternalSystemSchema.nullable(),
  id: z.string(),
  patientName: z.string(),
  patientPhone: z.string(),
  patientEmail: z.string().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  treatmentType: z.string().nullable(),
  notes: z.string().nullable(),
  approvedAt: z.coerce.date().nullable(),
  approvedBy: z.string().nullable(),
  createdById: z.string().nullable(),
  createdByRealName: z.string().nullable(),
  checkedInAt: z.coerce.date().nullable(),
  reminderSentAt: z.coerce.date().nullable(),
  canceledAt: z.coerce.date().nullable(),
  canceledBy: z.string().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  version: z.number().int(),
  isConsultation: z.boolean(),
  externalId: z.string().nullable(),
  treatmentId: z.string().nullable(),
  clinicId: z.string(),
  providerId: z.string(),
  patientId: z.string(),
  resourceId: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
})

export type Appointment = z.infer<typeof AppointmentSchema>

export default AppointmentSchema;
