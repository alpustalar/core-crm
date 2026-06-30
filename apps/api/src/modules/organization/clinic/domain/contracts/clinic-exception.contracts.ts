import { z } from 'zod';

// ==========================================
// KLİNİK İSTİSNA (EXCEPTION) SÖZLEŞMESİ
// ==========================================

export const ClinicExceptionCreatePropsSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid('Klinik ID zorunludur'),

  // İstisnanın gerçekleşeceği tarih
  date: z.date(),

  // İstisna durumu: Varsayılan olarak kapalı (true) kabul edilebilir
  // ancak business logic'ine göre özelleştirilebilir
  isClosed: z.boolean().default(true).optional(),

  // İstisna gerekçesi
  reason: z
    .string()
    .min(1, 'İstisna gerekçesi boş bırakılamaz')
    .nullable()
    .optional(),
});

export type ClinicExceptionCreateProps = z.infer<
  typeof ClinicExceptionCreatePropsSchema
>;
