import { z } from 'zod';

export const ClinicAppointmentSettingsScalarFieldEnumSchema = z.enum(['id','clinicId','rescheduleLimitHours','cancelLimitHours','allowPatientCancel','staffAllowOverbooking','sendSmsReminderHours','maxActivePatientBookings','requireReminderResponse','requireConfirmation','maxFutureBookingDays','createdAt','updatedAt']);

export default ClinicAppointmentSettingsScalarFieldEnumSchema;
