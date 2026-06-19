// domain/contracts/provider.contracts.ts
import { z } from 'zod';
import { ProviderAvailability, UpdateProviderInfoSchema } from '@shared';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';

// ==========================================
// 1. MERKEZİ ŞEMALAR VE KATMAN SÖZLEŞMELERİ (ZOD)
// ==========================================

// --- PROVIDER ---

export const CreateProviderSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  clinicId: z.uuid(),
  providerTitleId: z.uuid().optional(),
  providerSpecialtyId: z.uuid().optional(),
  sectorId: z.uuid().optional(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: 'Geçersiz e-posta formatı' }).optional(),
  isActive: z.coerce.boolean().default(true),
  canAcceptExamination: z.coerce.boolean().default(true),
  operationMode: OperationModeSchema.default(OperationModeSchema.enum.STATIC),
});

export type CreateProviderProps = z.infer<typeof CreateProviderSchema>;

// --- PROVIDER AVAILABILITY (Haftalık Çalışma Şablonu) ---
export const CreateProviderAvailabilitySchema = z.object({
  id: z.uuid().optional(),
  providerId: z.uuid(),
  dayOfWeek: z.number().min(0).max(6), // 0: Pazar, 6: Cumartesi
  startMinute: z.number().min(0).max(1440), // Gün içindeki dakika (örn: 540 -> 09:00)
  endMinute: z.number().min(0).max(1440),
  breakStartMinute: z.number().min(0).max(1440).nullable().optional(),
  breakEndMinute: z.number().min(0).max(1440).nullable().optional(),
});
export type CreateProviderAvailabilityData = z.infer<
  typeof CreateProviderAvailabilitySchema
>;

// --- PROVIDER SHIFT (Özel Gün Vardiyaları) ---
export const CreateProviderShiftSchema = z.object({
  providerId: z.uuid(),
  date: z.date(),
  startMinute: z.number().min(0).max(1440),
  endMinute: z.number().min(0).max(1440),
  breakStartMinute: z.number().min(0).max(1440).nullable().optional(),
  breakEndMinute: z.number().min(0).max(1440).nullable().optional(),
});
export type CreateProviderShiftData = z.infer<typeof CreateProviderShiftSchema>;

// ==========================================
// REPO SORGULARI VE YARDIMCI TİPLER
// ==========================================

export type FindScheduleProps = {
  providerId: string;
  startDate: Date;
  endDate: Date;
};

export type ProviderCanBookOrThrowProps = {
  providerId: string;
  startTime: Date;
  endTime: Date;
};

// Kompleks Birleşik Tipler (Include/Relation Tipleri)
export type ProviderAvailabilityWithCanAcceptExamination =
  ProviderAvailability & {
    provider: {
      canAcceptExamination: boolean;
      operationMode: z.infer<typeof OperationModeSchema>;
    };
  };

export type UpdateProviderProps = z.infer<typeof UpdateProviderInfoSchema>;
