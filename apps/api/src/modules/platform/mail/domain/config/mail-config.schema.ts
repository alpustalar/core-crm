import { z } from 'zod';

export const mailConfigSchema = z.object({
  EMAIL_ADDRESS: z.email('Geçersiz e-posta adresi'),
  EMAIL_PASSWORD: z.string().min(1, 'E-posta şifresi boş olamaz'),
  EMAIL_SMTP_HOST: z.string().min(1, 'SMTP Host bilgisi eksik'),
  EMAIL_SMTP_PORT: z.coerce.number().default(587),
  APP_NAME: z.string().default('Bursa Dentistry CRM'),
});

export type MailConfig = z.infer<typeof mailConfigSchema>;
