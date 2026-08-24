import { ProviderAvailability as IProviderAvailability } from '@shared';

/**
 * `endMinute > startMinute` ve "mola mesai içinde kalmalı" kuralları burada
 * değil; `ProviderAvailability.create()` içinde `DayMinuteRange.create()` +
 * `.validate.isCompletelyWithIn()` ile entity'nin kendisi enforce ediyor
 * (bkz. domain/entities/provider-availability.entity.ts). Eski Zod
 * `.refine()`'ları hiçbir zaman `.parse()` edilmediği için bu kural aslında
 * hiç işletilmiyordu — dönüşümle birlikte entity'ye taşınarak gerçek zamanlı
 * enforcement kazandırıldı.
 */
export interface CreateProviderAvailabilityProps {
  id?: string;
  providerId: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}

export interface UpdateProviderAvailabilityProps {
  startMinute?: number;
  endMinute?: number;
  breakStartMinute?: number | null;
  breakEndMinute?: number | null;
}

export type ProviderAvailabilityWithAcceptsConsultation =
  IProviderAvailability & {
    provider: {
      acceptsConsultation: boolean;
    };
  };
