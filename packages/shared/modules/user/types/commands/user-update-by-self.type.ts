import { UserUpdateBySelfSchema } from '@shared/modules/user/schemas/commands/user-update-by-self.schema';
import { z } from 'zod';

export type UserUpdateBySelf = z.infer<typeof UserUpdateBySelfSchema>;
