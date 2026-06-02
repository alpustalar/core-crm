import { createZodDto } from 'nestjs-zod';
import { BookAppointmentSchema } from '@shared/modules/appointment/schemas/command/index';

export class BookAppointmentDto extends createZodDto(BookAppointmentSchema) {}
