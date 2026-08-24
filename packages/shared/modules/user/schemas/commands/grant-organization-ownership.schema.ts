import { z } from 'zod';

/**
 * Kullanıcının SAHİBİ olduğu organizasyonlar — sistemdeki en geniş kapsam.
 * Kendi ucunda durur ve tam liste (replace) semantiği taşır; `[]` sahipliği
 * tamamen kaldırır.
 */
export const GrantOrganizationOwnershipSchema = z.object({
  organizationIds: z.array(
    z.uuid({ message: 'Dizi içindeki Organizasyon ID geçersiz formatta' })
  ),
});
