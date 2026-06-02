import { createZodDto } from 'nestjs-zod';
import { ScheduleAppointmentSchema } from '@shared/modules/appointment/schemas/command/index';

export class ScheduleAppointmentDto extends createZodDto(
  ScheduleAppointmentSchema
) {}
