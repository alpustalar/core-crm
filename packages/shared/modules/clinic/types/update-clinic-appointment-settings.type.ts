import { z } from 'zod';
import { UpdateClinicAppointmentSettingsSchema } from '../schemas/update-clinic-appointment-settings.schema';

export type UpdateClinicAppointmentSettings = z.infer<
  typeof UpdateClinicAppointmentSettingsSchema
>;
