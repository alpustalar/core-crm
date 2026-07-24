import { createZodDto } from 'nestjs-zod';
import { UpdateClinicAppointmentSettingsSchema } from '@shared/modules/clinic';

export class UpdateClinicAppointmentSettingsDto extends createZodDto(
  UpdateClinicAppointmentSettingsSchema
) {}
