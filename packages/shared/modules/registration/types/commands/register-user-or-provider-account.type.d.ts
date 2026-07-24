import { RegisterUserOrProviderAccountSchema } from '@shared/modules/registration/schemas/commands/register-user-or-provider-account.schema';
import { z } from 'zod';

export type CreateUser = z.infer<typeof RegisterUserOrProviderAccountSchema>;
