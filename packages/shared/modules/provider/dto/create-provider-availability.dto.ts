import { createZodDto } from 'nestjs-zod';
import { CreateProviderAvailabilitySchema } from '../schemas';

export class CreateProviderAvailabilityDto extends createZodDto(
  CreateProviderAvailabilitySchema,
) {}
