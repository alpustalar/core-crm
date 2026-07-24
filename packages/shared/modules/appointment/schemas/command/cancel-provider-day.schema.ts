import { z } from 'zod';

/**
 * Doktor müsait değil (rapor/izin/acil) senaryosunda, bir doktorun verilen tarih
 * aralığındaki iptal edilebilir randevularının toplu iptali. clinicId gövdede
 * taşınmaz — handler aktörün kliniğini kullanır. Aralık UTC anlarıdır.
 */
export const CancelProviderDaySchema = z
  .object({
    providerId: z.uuid({ message: 'Geçerli bir doktor seçilmelidir.' }),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    cancelReason: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Bitiş tarihi başlangıçtan önce olamaz.',
    path: ['endDate'],
  });
