import { CheckEmailSchema } from '@shared/modules/user/schemas/queries/check-email.schema';
import { z } from 'zod';

export type CheckEmail = z.infer<typeof CheckEmailSchema>;
