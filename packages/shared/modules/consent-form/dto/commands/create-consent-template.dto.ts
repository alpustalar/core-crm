import { createZodDto } from 'nestjs-zod';
import { CreateConsentTemplateSchema } from '../../schemas/commands';

export class CreateConsentTemplateDto extends createZodDto(
  CreateConsentTemplateSchema
) {}
