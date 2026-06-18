import { z } from 'zod';

export const ClinicAppointmentSettingsScalarFieldEnumSchema = z.enum(['id','rescheduleLimitHours','cancelLimitHours','allowPatientCancel','requireConfirmation','maxFutureBookingDays','clinicId','createdAt','updatedAt']);

export default ClinicAppointmentSettingsScalarFieldEnumSchema;
