import { createZodDto } from 'nestjs-zod';
import { SendMessageSchema } from '../../schemas/commands';

export class SendMessageDto extends createZodDto(SendMessageSchema) {}
