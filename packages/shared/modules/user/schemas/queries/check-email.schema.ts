import { z } from 'zod';
import { EmailSchema } from '@shared/common/schemas';

export const CheckEmailSchema = z.object({
  email: EmailSchema,
});
