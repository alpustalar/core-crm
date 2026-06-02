import { createZodDto } from 'nestjs-zod';
import { UserSoftDeleteByActorSchema } from '@shared/modules/user/schemas/commands/index';

export class UserSoftDeleteByActorDto extends createZodDto(
  UserSoftDeleteByActorSchema
) {}
