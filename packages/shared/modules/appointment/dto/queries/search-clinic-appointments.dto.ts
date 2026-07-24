import { createZodDto } from 'nestjs-zod';
import { SearchClinicAppointmentsSchema } from '@shared/modules/appointment/schemas/queries/search-clinic-appointments.schema';

export class SearchClinicAppointmentsDto extends createZodDto(
  SearchClinicAppointmentsSchema
) {}
