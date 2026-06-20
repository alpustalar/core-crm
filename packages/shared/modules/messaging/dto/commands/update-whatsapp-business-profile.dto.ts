import { createZodDto } from 'nestjs-zod';
import { UpdateWhatsappBusinessProfileSchema } from '../../schemas/commands';

export class UpdateWhatsappBusinessProfileDto extends createZodDto(
  UpdateWhatsappBusinessProfileSchema
) {}
