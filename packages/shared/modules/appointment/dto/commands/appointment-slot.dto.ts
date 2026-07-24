import { createZodDto } from 'nestjs-zod';
import { AppointmentSlotSchema } from '@shared/modules/appointment/schemas/command/appointment-slot.schema';

export class AppointmentSlotDto extends createZodDto(AppointmentSlotSchema) {}
