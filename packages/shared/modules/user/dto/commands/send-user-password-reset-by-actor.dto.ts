import { createZodDto } from 'nestjs-zod';
import { SendUserPasswordResetByActorSchema } from '@shared/modules/user/schemas/commands';

export class SendUserPasswordResetByActorDto extends createZodDto(
  SendUserPasswordResetByActorSchema
) {}
