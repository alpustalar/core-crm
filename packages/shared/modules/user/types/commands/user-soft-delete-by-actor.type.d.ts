import { z } from 'zod';
import { UserSoftDeleteByActorSchema } from '@shared/modules/user/schemas/commands/index';

export type UserSoftDeleteByActor = z.infer<typeof UserSoftDeleteByActorSchema>;
