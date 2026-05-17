import { z } from 'zod';
import { UserSoftDeleteByActorSchema } from '@shared/modules/user/schemas/commands/index';

// 3. Type
export type UserSoftDeleteByActor = z.infer<typeof UserSoftDeleteByActorSchema>;
