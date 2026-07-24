import { z } from 'zod';

// ==========================================
// VARDİYA (SHIFT) OLUŞTURMA SÖZLEŞMELERİ
// ==========================================

export const CreateShiftPropsSchema = z
  .object({
    id: z.uuid().optional(),
    providerId: z.uuid('Personel ID bilgisi zorunludur'),
    date: z.date(),

    // Günün toplam dakikası (0 - 1440) üzerinden doğrulama
    startMinute: z.number().int().min(0).max(1440),
    endMinute: z.number().int().min(0).max(1440),

    breakStartMinute: z.number().int().min(0).max(1440).nullable().optional(),
    breakEndMinute: z.number().int().min(0).max(1440).nullable().optional(),
  })
  .refine((data) => data.endMinute > data.startMinute, {
    message: 'Vardiya bitiş süresi başlangıçtan büyük olmalıdır',
    path: ['endMinute'],
  })
  .refine(
    (data) => {
      // Eğer mola varsa başlangıç ve bitişinin mantıklı olması
      if (data.breakStartMinute && data.breakEndMinute) {
        return data.breakEndMinute > data.breakStartMinute;
      }
      return true;
    },
    {
      message: 'Mola bitiş süresi başlangıçtan büyük olmalıdır',
      path: ['breakEndMinute'],
    }
  );

export type CreateShiftProps = z.infer<typeof CreateShiftPropsSchema>;

export const UpdateHoursAndDateSchema = CreateShiftPropsSchema.omit({
  id: true,
  providerId: true,
}).partial();

export type UpdateHoursAndDateProps = z.infer<typeof UpdateHoursAndDateSchema>;
