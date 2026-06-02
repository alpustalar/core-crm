import { createZodDto } from 'nestjs-zod';
import { CancelAppointmentSchema } from '@shared/modules/appointment/schemas/command/cancel-appointment.schema';

export class CancelAppointmentDto extends createZodDto(
  CancelAppointmentSchema
) {}