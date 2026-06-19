import { createZodDto } from 'nestjs-zod';
import { GetConversationsSchema } from '../../schemas/queries';

export class GetConversationsDto extends createZodDto(
  GetConversationsSchema
) {}
