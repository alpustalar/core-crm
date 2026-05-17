import { z } from 'zod';
import { ChangeUserPasswordSchema } from '@shared/modules/user/schemas/commands/index';

export type ChangeUserPassword = z.infer<typeof ChangeUserPasswordSchema>;
