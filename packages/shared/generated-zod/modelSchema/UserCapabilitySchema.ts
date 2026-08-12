import { z } from 'zod';

/////////////////////////////////////////
// USER CAPABILITY SCHEMA
/////////////////////////////////////////

/**
 * Rolün ÜSTÜNE, tek bir kullanıcıya verilen ek yetki.
 * 
 * Roller global (kiracı kolonu yok) olduğu için bir rolün yetkisini değiştirmek
 * sistemdeki tüm klinikleri etkiler. Klinik yöneticisinin kendi personeline
 * yetki verebilmesi bu yüzden rol üzerinden değil, kişi bazında yürür.
 * Yetki kaldırma satırın silinmesidir; "negatif yetki" (rolden düşürme) yoktur.
 */
export const UserCapabilitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  capabilityId: z.string(),
  /**
   * Yetkiyi veren yönetici — denetim izi. Veren hesap silinirse iz null'a düşer,
   * yetki ayakta kalır (personelin erişimi yöneticinin ayrılmasıyla kesilmez).
   */
  grantedById: z.string().nullable(),
  /**
   * Yöneticinin gerekçesi (ör. "nöbet dönemi kasa devri").
   */
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type UserCapability = z.infer<typeof UserCapabilitySchema>

export default UserCapabilitySchema;
