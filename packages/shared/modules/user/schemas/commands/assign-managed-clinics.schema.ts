import { z } from 'zod';

/**
 * Kullanıcının YÖNETTİĞİ klinikler. Profil güncellemesinden ayrı bir uçta durur:
 * bu bir yetki devridir, isim/telefon değişikliğiyle aynı istekte taşınırsa bir
 * DTO hatası ya da dikkatsizlik kullanıcının tüm yönetim kapsamını silebilir.
 *
 * Liste TAM listedir (replace): gönderilen küme yeni kapsamdır, `[]` tüm
 * atamaları kaldırır. Kısmi ekleme/çıkarma yok — böylece istemcinin eksik
 * gönderdiği bir dizi "farkı uygula" sanılıp sessizce yorumlanmaz.
 */
export const AssignManagedClinicsSchema = z.object({
  clinicIds: z.array(
    z.uuid({ message: 'Dizi içindeki Klinik ID geçersiz formatta' })
  ),
});
