import { createZodDto } from 'nestjs-zod';
import { ChangeUserPasswordSchema } from '@shared/modules/user/schemas/commands';

export class ChangeUserPasswordDto extends createZodDto(
  ChangeUserPasswordSchema
) {}
