import { createZodDto } from 'nestjs-zod';
import { UpdateAppointmentDetailsSchema } from '@shared/modules/appointment/schemas/command/update-appointment-details.schema';

export class UpdateAppointmentDetailsDto extends createZodDto(
  UpdateAppointmentDetailsSchema
) {}
