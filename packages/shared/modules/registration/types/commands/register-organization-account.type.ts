import { z } from 'zod';
import { RegisterOrganizationAccountSchema } from '../../schemas/commands';

export type RegisterOrganizationAccount = z.infer<typeof RegisterOrganizationAccountSchema>;
