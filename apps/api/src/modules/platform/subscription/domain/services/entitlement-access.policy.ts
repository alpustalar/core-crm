import { SubStatusSchema } from '@shared';
import { PlanIdSchema } from '@input-type-schemas/PlanIdSchema';
import { DateTimeManager } from '@common/utils';
import { EntitlementSource } from '@modules/platform/subscription/domain/contracts/subscription.contracts';

/**
 * Kiracının abonelik durumundan erişim hakkı doğar mı — tek karar noktası (saf fonksiyon).
 * - Deneme (trialEndsAt dolu): yalnız trialEndsAt gelecekteyken açık; dolduğu an kapanır (grace YOK).
 * - ACTIVE: açık.
 * - PAST_DUE: dönem bitişi + graceDays içindeyse açık (yumuşak dunning).
 * - CANCELED / EXPIRED: kapalı.
 */
export function subscriptionGrantsAccess(
  source: EntitlementSource,
  graceDays: number,
  now: Date = DateTimeManager.create()
): boolean {
  if (source.trialEndsAt) {
    return source.trialEndsAt > now;
  }

  switch (source.status) {
    case SubStatusSchema.enum.ACTIVE:
      return true;
    case SubStatusSchema.enum.PAST_DUE:
      if (!source.currentPeriodEnd) return true;
      return DateTimeManager.addDays(source.currentPeriodEnd, graceDays) > now;
    default:
      return false;
  }
}

/**
 * Modül çözümlemesinde kullanılacak efektif plan — deneme sürümü BASIC bundle'ını açar.
 * (FREE_TRIAL plan satırının modül yapılandırmasına bağımlı kalmamak için kod düzeyinde eşlenir.)
 */
export function resolveEffectivePlanId(planId: string | null): string | null {
  if (planId === PlanIdSchema.enum.FREE_TRIAL) {
    return PlanIdSchema.enum.BASIC;
  }
  return planId;
}
