import { z } from 'zod';

export const SendTemplateMessageSchema = z.object({
  templateName: z.string().min(1),
  languageCode: z.string().min(2), // ör: 'tr', 'en_US'
  /** body component değişkenleri (sıralı). */
  variables: z.array(z.string()).optional(),
  /** header text component değişkeni. */
  headerText: z.string().optional(),
  /** header media (image/video/document) link'i. */
  headerMediaUrl: z.string().url().optional(),
  headerMediaType: z.enum(['image', 'video', 'document']).optional(),
  /** dinamik URL buton suffix'leri (buton index sırasına göre). */
  buttonParams: z.array(z.string()).optional(),
  /** Şablon kategorisi (MARKETING ise opt-out kontrol edilir). */
  category: z.string().optional(),
});
