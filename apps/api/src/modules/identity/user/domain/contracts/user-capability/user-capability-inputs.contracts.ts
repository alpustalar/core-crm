/**
 * Repository'e (Prisma) paslanan ham veri — `...Data` soneki bu yüzden.
 * `id` handler'da UUID.generate() ile üretilir; şema hiçbir zaman DB'ye ID
 * ürettirmez.
 */
export interface GrantUserCapabilityData {
  id: string;
  userId: string;
  capabilityId: string;
  grantedById: string;
  reason: string | null;
}
