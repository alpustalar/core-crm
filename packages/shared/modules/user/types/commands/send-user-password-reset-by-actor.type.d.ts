import { z } from 'zod';
import { SendUserPasswordResetByActorSchema } from '@shared/modules/user/schemas/commands/index';

export type SendUserPasswordResetByActor = z.infer<
  typeof SendUserPasswordResetByActorSchema
>;
