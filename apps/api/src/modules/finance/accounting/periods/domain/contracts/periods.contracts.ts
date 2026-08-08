import { z } from 'zod';

// ==========================================
// ACCOUNTING PERIOD (MUHASEBE DÖNEMİ) SÖZLEŞMELERİ
// ==========================================

export const CreateAccountingPeriodSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),

  // Yıl bilgisi için 2026 disiplinine uygun katı sayı doğrulaması
  year: z.number().int().min(2000).max(2100),
});

export type CreateAccountingPeriodProps = z.infer<
  typeof CreateAccountingPeriodSchema
>;
