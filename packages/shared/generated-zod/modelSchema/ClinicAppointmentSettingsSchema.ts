import { z } from 'zod';

/////////////////////////////////////////
// CLINIC APPOINTMENT SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicAppointmentSettingsSchema = z.object({
  id: z.string(),
  clinicId: z.string(),
  rescheduleLimitHours: z.number().int(),
  cancelLimitHours: z.number().int(),
  allowPatientCancel: z.boolean(),
  staffAllowOverbooking: z.boolean(),
  sendSmsReminderHours: z.number().int(),
  maxActivePatientBookings: z.number().int(),
  requireReminderResponse: z.boolean(),
  requireConfirmation: z.boolean(),
  maxFutureBookingDays: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicAppointmentSettings = z.infer<typeof ClinicAppointmentSettingsSchema>

export default ClinicAppointmentSettingsSchema;
