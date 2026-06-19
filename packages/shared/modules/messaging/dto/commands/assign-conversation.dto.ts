import { createZodDto } from 'nestjs-zod';
import { AssignConversationSchema } from '../../schemas/commands';

export class AssignConversationDto extends createZodDto(
  AssignConversationSchema
) {}
