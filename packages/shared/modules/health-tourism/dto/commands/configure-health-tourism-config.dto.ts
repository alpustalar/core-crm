import { createZodDto } from 'nestjs-zod';
import { ConfigureHealthTourismConfigSchema } from '../../schemas/commands';

export class ConfigureHealthTourismConfigDto extends createZodDto(
  ConfigureHealthTourismConfigSchema
) {}
