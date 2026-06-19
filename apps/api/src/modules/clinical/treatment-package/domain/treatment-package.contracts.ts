import { z } from 'zod';
import { Money } from '@src/domain/value-objects/money.vo';

// ==========================================
// KATMAN SÖZLEŞMELERİ (Şemadan Türeyenler)
// ==========================================

// ==========================================
// 1. TREATMENT PACKAGE ITEM
// ==========================================
export const TreatmentPackageItemSchema = z.object({
  treatmentId: z.uuid(),
  count: z.number().int().min(1),
});
export type TreatmentPackageItemProps = z.infer<
  typeof TreatmentPackageItemSchema
>;

// ==========================================
// 2. CREATE TREATMENT PACKAGE
// ==========================================
export const CreateTreatmentPackageSchema = z.object({
  clinicId: z.uuid(),
  name: z.string().min(1, 'Paket adı zorunludur'),
  examinationCount: z.number().int().min(0),
  controlCount: z.number().int().min(0),
  validityDays: z.number().int().min(1),

  // Private constructor krizini çözen esnek custom tanımı:
  price: z.custom<Money>((val) => val instanceof Money),

  // Interface'indeki gibi opsiyonel diziler:
  providerIds: z.array(z.uuid()).optional(),
  items: z.array(TreatmentPackageItemSchema).optional(),
});
export type CreateTreatmentPackageProps = z.infer<
  typeof CreateTreatmentPackageSchema
>;

// ==========================================
// 3. UPDATE TREATMENT PACKAGE
// ==========================================
export const UpdateTreatmentPackageSchema = z.object({
  name: z.string().min(1).optional(),
  examinationCount: z.number().int().min(0).optional(),
  controlCount: z.number().int().min(0).optional(),
  validityDays: z.number().int().min(1).optional(),
  price: z.custom<Money>((val) => val instanceof Money).optional(),
  isActive: z.boolean().optional(),
  providerIds: z.array(z.uuid()).optional(),
  items: z.array(TreatmentPackageItemSchema).optional(),
});
export type UpdateTreatmentPackageProps = z.infer<
  typeof UpdateTreatmentPackageSchema
>;
