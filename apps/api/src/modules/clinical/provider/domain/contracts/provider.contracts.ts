import { z } from 'zod';
import { ProviderAvailability as IProviderAvailability, UpdateProviderInfoSchema, } from '@shared';
import { OperationModeSchema } from '@input-type-schemas/OperationModeSchema';
import { ResponseGroups } from '@common/constants/response-groups.constant';

// ==========================================
// 1. MERKEZİ ŞEMALAR VE KATMAN SÖZLEŞMELERİ (ZOD)
// ==========================================

// --- PROVIDER ---

export const CreateProviderSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  clinicId: z.uuid(),
  providerTitleId: z.uuid().optional(),
  providerSpecialtyId: z.uuid().optional(),
  sectorId: z.uuid().optional(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: 'Geçersiz e-posta formatı' }).optional(),
  isActive: z.coerce.boolean().default(true),
  acceptsConsultation: z.coerce.boolean().default(true),
  operationMode: OperationModeSchema.default(OperationModeSchema.enum.STATIC),
});

export type CreateProviderProps = z.infer<typeof CreateProviderSchema>;

// --- PROVIDER AVAILABILITY (Haftalık Çalışma Şablonu) ---
export const CreateProviderAvailabilitySchema = z.object({
  id: z.uuid(),
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

export type ProviderAvailabilityWithAcceptsConsultation =
  IProviderAvailability & {
    provider: {
      acceptsConsultation: boolean;
    };
  };

export type UpdateProviderProps = z.infer<typeof UpdateProviderInfoSchema>;

/**
 * Read-model: bir kliniğin aktif provider'larını uzmanlık + unvan adlarıyla (çeviriden
 * çözülmüş, tek dil) döndürür. AI asistanının hastanın derdine göre doğru uzmanı seçmesi
 * ve uzman bilgisi vermesi için kullanılır. Entity değil, projeksiyondur.
 */
export type ProviderDirectoryEntry = {
  providerId: string;
  name: string;
  specialty: string | null;
  title: string | null;
  isActive: boolean;
};

export const ProviderResponseGroups = {
  ...ResponseGroups,
} as const;

export type ProviderResponseGroup =
  (typeof ProviderResponseGroups)[keyof typeof ProviderResponseGroups];
