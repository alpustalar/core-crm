import { createZodDto } from 'nestjs-zod';
import { GetConsentTemplatesFilterSchema } from '../../schemas/queries';

export class GetConsentTemplatesFilterDto extends createZodDto(
  GetConsentTemplatesFilterSchema
) {}
