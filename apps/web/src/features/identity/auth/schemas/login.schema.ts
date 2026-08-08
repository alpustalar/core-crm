import { z } from 'zod';

/**
 * UI-only şema — bilinçli olarak `shared`da değil. Giriş backend'e değil,
 * Firebase'e yapılıyor; ortada paylaşılacak bir sunucu sözleşmesi yok.
 * (`shared` yalnız iki ucun ortak sözleşmesi içindir; bkz. §6.)
 */
export const LoginFormSchema = z.object({
  email: z.email('Geçerli bir e-posta adresi gir.'),
  password: z.string().min(6, 'Parola en az 6 karakter olmalı.'),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;
