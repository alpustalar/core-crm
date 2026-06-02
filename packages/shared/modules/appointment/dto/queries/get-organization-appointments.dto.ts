import { createZodDto } from 'nestjs-zod';
import { GetOrganizationAppointmentsSchema } from '@shared/modules/index';

export class GetOrganizationAppointmentsDto extends createZodDto(
  GetOrganizationAppointmentsSchema
) {}
