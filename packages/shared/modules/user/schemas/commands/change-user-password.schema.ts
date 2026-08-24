import { z } from 'zod';

export const ChangeUserPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
});
