import { z } from 'zod';
import { CreateProviderSchema } from '@shared/modules/provider/schemas/index';

export const RegisterUserOrProviderAccountSchema = z.object({
  email: z.email({ message: 'Geçersiz e-posta formatı' }).trim().toLowerCase(),
  displayName: z.string().min(1, { message: 'İsim alanı boş bırakılamaz' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır' }),
  picture: z.url({ message: 'Geçersiz resim bağlantısı' }).optional(),
  roleId: z.uuid({ message: 'Geçersiz Role ID formatı' }),
  organizationId: z.uuid({ message: 'Geçersiz Organization ID formatı' }),
  clinicId: z.uuid({ message: 'Geçersiz Clinic ID formatı' }),
  providerProfile: z.lazy(() => CreateProviderSchema.optional()),
});
