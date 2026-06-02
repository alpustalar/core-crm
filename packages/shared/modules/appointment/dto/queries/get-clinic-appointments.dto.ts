import { createZodDto } from 'nestjs-zod';
import { GetClinicAppointmentsSchema } from '@shared/modules';

export class GetClinicAppointmentsDto extends createZodDto(
  GetClinicAppointmentsSchema
) {}
