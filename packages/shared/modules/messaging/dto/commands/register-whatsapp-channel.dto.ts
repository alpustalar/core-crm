import { createZodDto } from 'nestjs-zod';
import { RegisterWhatsappChannelSchema } from '../../schemas/commands';

export class RegisterWhatsappChannelDto extends createZodDto(
  RegisterWhatsappChannelSchema
) {}
