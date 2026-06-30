import { z } from 'zod';

// ==========================================
// KLİNİK MESAİ SÖZLEŞMESİ (PROPS)
// ==========================================

export const ClinicAvailabilityCreatePropsSchema = z
  .object({
    id: z.uuid().optional(),
    clinicId: z.uuid('Klinik ID zorunludur'),

    // Gün kontrolü: 0-6 arası (Pazar-Cumartesi)
    dayOfWeek: z.number().int().min(0).max(6),

    // Günün dakikası: 0-1440 aralığı
    startMinute: z.number().int().min(0).max(1440),
    endMinute: z.number().int().min(0).max(1440),

    // Varsayılan değer yönetimi
    isClosed: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      // Eğer klinik kapalı değilse, bitiş saati başlangıçtan büyük olmalıdır
      if (!data.isClosed) {
        return data.endMinute > data.startMinute;
      }
      return true;
    },
    {
      message:
        'Klinik açık olduğu durumda bitiş saati başlangıçtan büyük olmalıdır',
      path: ['endMinute'],
    }
  );

export type ClinicAvailabilityCreateProps = z.infer<
  typeof ClinicAvailabilityCreatePropsSchema
>;
