import { GetProviderAvailabilitySchema } from '@shared/modules/appointment/schemas/queries/get-provider-availability.schema';
import { createZodDto } from 'nestjs-zod';

export class GetProviderAvailabilityDto extends createZodDto(
  GetProviderAvailabilitySchema
) {}
