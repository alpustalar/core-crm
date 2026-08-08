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

export const CreateRolePropsSchema = z.object({
  name: z.string().min(2, 'Rol ismi en az 2 karakter olmalıdır').trim(),
  priority: z.number().int().min(0, 'Öncelik negatif olamaz'),
  isSystemRole: z.boolean().default(false),
});

export type CreateRoleProps = z.infer<typeof CreateRolePropsSchema>;
