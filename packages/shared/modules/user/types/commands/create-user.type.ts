import { CreateUserSchema } from '@shared/modules/user/schemas/commands/create-user.schema';
import { z } from 'zod';

export type CreateUser = z.infer<typeof CreateUserSchema>;
