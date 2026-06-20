import { createZodDto } from 'nestjs-zod';
import { SendTemplateMessageSchema } from '../../schemas/commands';

export class SendTemplateMessageDto extends createZodDto(
  SendTemplateMessageSchema
) {}
