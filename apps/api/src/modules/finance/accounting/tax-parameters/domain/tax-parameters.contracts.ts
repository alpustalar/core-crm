import { z } from 'zod';
import { TaxParameterKeySchema } from '@input-type-schemas/TaxParameterKeySchema';

// ==========================================
// 1. REPO VE ENTITY SEVİYESİ SÖZLEŞMELERİ (PROPS)
// ==========================================

export const CreateTaxParameterSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  key: TaxParameterKeySchema, // Orijinal enum/tip şeması (Örn: VAT_20, STOPPAJ_20)
  rate: z.number().min(0, "Vergi oranı 0'dan küçük olamaz"),
  validFrom: z.date(),
  validTo: z.date().nullable().optional(),
});

export type CreateTaxParameterProps = z.infer<typeof CreateTaxParameterSchema>;

// ==========================================
// 2. UYGULAMA / COMMAND SEVİYESİ SÖZLEŞMELERİ (INPUT)
// ==========================================

export const SetTaxParameterInputSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  key: TaxParameterKeySchema,
  rate: z.number().min(0, "Vergi oranı 0'dan küçük olamaz"),
  validFrom: z.date().optional(), // Verilmezse command handler içinde 'new Date()' atanabilir
});

export type SetTaxParameterInput = z.infer<typeof SetTaxParameterInputSchema>;
