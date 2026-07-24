import { createZodDto } from 'nestjs-zod';
import { UpdateConsentTemplateSchema } from '../../schemas/commands';

export class UpdateConsentTemplateDto extends createZodDto(
  UpdateConsentTemplateSchema
) {}
