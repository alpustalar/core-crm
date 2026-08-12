import { createZodDto } from 'nestjs-zod';
import { GrantUserCapabilitySchema } from '../../schemas/commands';

export class GrantUserCapabilityDto extends createZodDto(
  GrantUserCapabilitySchema
) {}
