import { z } from 'zod';
import { UpdateUserByActorSchema } from '@shared/modules/user/schemas/commands/index';

export type UpdateUserByActor = z.infer<typeof UpdateUserByActorSchema>;
