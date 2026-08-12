import { z } from 'zod';

/**
 * Repository'e (Prisma) paslanan ham veri — `...Data` soneki bu yüzden.
 * `id` handler'da UUID.generate() ile üretilir; şema hiçbir zaman DB'ye ID
 * ürettirmez.
 */
export const GrantUserCapabilityDataSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  capabilityId: z.uuid(),
  grantedById: z.uuid(),
  reason: z.string().nullable(),
});
export type GrantUserCapabilityData = z.infer<
  typeof GrantUserCapabilityDataSchema
>;

/**
 * Bir kullanıcının etkin yetkisi ve nereden geldiği. Yönetim ekranı "bunu
 * kaldırabilir miyim" sorusunu `source` alanına bakarak yanıtlar: rolden gelen
 * yetki bu ekrandan kaldırılamaz, rol değiştirilerek kaldırılır.
 */
export const EffectiveCapabilitySchema = z.object({
  capability: z.string(),
  module: z.string(),
  action: z.string(),
  source: z.enum(['ROLE', 'GRANT']),
  grantedAt: z.date().nullable(),
  grantedById: z.string().nullable(),
  reason: z.string().nullable(),
});
export type EffectiveCapability = z.infer<typeof EffectiveCapabilitySchema>;
