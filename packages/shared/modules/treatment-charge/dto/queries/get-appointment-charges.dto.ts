import { createZodDto } from 'nestjs-zod';
import { GetAppointmentChargesSchema } from '../../schemas/queries';

export class GetAppointmentChargesFilterDto extends createZodDto(
  GetAppointmentChargesSchema
) {}
