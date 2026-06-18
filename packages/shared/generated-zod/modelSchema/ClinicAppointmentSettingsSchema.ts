import { z } from 'zod';

/////////////////////////////////////////
// CLINIC APPOINTMENT SETTINGS SCHEMA
/////////////////////////////////////////

export const ClinicAppointmentSettingsSchema = z.object({
  id: z.uuid(),
  rescheduleLimitHours: z.number().int(),
  cancelLimitHours: z.number().int(),
  allowPatientCancel: z.boolean(),
  requireConfirmation: z.boolean(),
  maxFutureBookingDays: z.number().int(),
  clinicId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ClinicAppointmentSettings = z.infer<typeof ClinicAppointmentSettingsSchema>

export default ClinicAppointmentSettingsSchema;
