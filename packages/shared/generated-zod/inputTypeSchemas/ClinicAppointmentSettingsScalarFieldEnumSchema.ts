import { z } from 'zod';

export const ClinicAppointmentSettingsScalarFieldEnumSchema = z.enum(['id','clinicId','allowPatientBooking','rescheduleLimitHours','cancelLimitHours','allowPatientCancel','staffAllowOverbooking','sendSmsReminderHours','maxActivePatientBookings','requireReminderResponse','requireConfirmation','maxFutureBookingDays','slotDurationMinutes','createdAt','updatedAt']);

export default ClinicAppointmentSettingsScalarFieldEnumSchema;
