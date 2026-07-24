import { GetClinicOpenSlotsSchema } from '@shared/modules/appointment/schemas/queries/get-clinic-open-slots.schema';
import { createZodDto } from 'nestjs-zod';

export class GetClinicOpenSlotsDto extends createZodDto(
  GetClinicOpenSlotsSchema
) {}
