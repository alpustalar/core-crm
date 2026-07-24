import { z } from 'zod';

// ==========================================
// MESAİ VE MOLA DOĞRULAMA KURALLARI
// ==========================================

const AvailabilityValidation = z
  .object({
    startMinute: z.number().int().min(0).max(1440),
    endMinute: z.number().int().min(0).max(1440),
    breakStartMinute: z.number().int().min(0).max(1440).nullable().optional(),
    breakEndMinute: z.number().int().min(0).max(1440).nullable().optional(),
  })
  .refine((data) => data.endMinute > data.startMinute, {
    message: 'Vardiya bitiş saati başlangıçtan büyük olmalıdır',
    path: ['endMinute'],
  })
  .refine(
    (data) => {
      // Mola kuralları: Mola varsa başlangıç < bitiş olmalı ve mesai içinde kalmalı
      if (data.breakStartMinute != null && data.breakEndMinute != null) {
        if (data.breakEndMinute <= data.breakStartMinute) return false;
        if (
          data.breakStartMinute < data.startMinute ||
          data.breakEndMinute > data.endMinute
        )
          return false;
      }
      return true;
    },
    {
      message:
        'Mola saatleri çalışma saatleri (startMinute - endMinute) içerisinde olmalıdır',
      path: ['breakStartMinute'],
    }
  );

// ==========================================
// 1. OLUŞTURMA SÖZLEŞMESİ (CREATE)
// ==========================================

export const CreateProviderAvailabilityPropsSchema =
  AvailabilityValidation.extend({
    id: z.uuid().optional(),
    providerId: z.uuid('Geçerli bir providerId zorunludur'),
    dayOfWeek: z.number().int().min(0).max(6), // 0: Pazar, 6: Cumartesi
  });
export type CreateProviderAvailabilityProps = z.infer<
  typeof CreateProviderAvailabilityPropsSchema
>;

// ==========================================
// 2. GÜNCELLEME SÖZLEŞMESİ (UPDATE)
// ==========================================

export const UpdateProviderAvailabilityPropsSchema =
  AvailabilityValidation.partial();
export type UpdateProviderAvailabilityProps = z.infer<
  typeof UpdateProviderAvailabilityPropsSchema
>;
