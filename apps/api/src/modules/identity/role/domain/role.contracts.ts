import { z } from 'zod';

// ==========================================
// SLUG SORGULAMA YANIT SÖZLEŞMELERİ
// ==========================================

export const FindBySlugResponseSchema = z
  .object({
    id: z.uuid(), // 2026 Standartı: İç sistem ID doğrulaması
    slug: z.string().min(1, 'Slug alanı boş olamaz'),
  })
  .nullable(); // Kayıt bulunamadığında null dönebilmesi için .nullable() zırhı

export type FindBySlugResponse = z.infer<typeof FindBySlugResponseSchema>;
