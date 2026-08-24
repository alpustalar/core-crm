import { ProjectResourceKindSchema } from '@input-type-schemas/ProjectResourceKindSchema';
import { ProjectResourceKindType as ResourceKind } from '@input-type-schemas/ProjectResourceKindSchema';
import { OverlappingAllocation } from '@modules/organization/project/domain/contracts';

/**
 * Kaynak kapasite kuralı — saf fonksiyon (entity/repository bilmez, I/O yapmaz).
 *
 * İki farklı kaynak doğası vardır:
 * - **EMPLOYEE**: bölünebilir. Aynı anda birden çok projeye ayrılabilir; çakışan
 *   aralıklardaki yüzdelerin toplamı %100'ü aşamaz.
 * - **ROOM / EQUIPMENT**: bölünemez. Mekân/cihaz aynı anda tek projededir;
 *   çakışan herhangi bir tahsis doğrudan çakışmadır.
 *
 * Aralık örtüşmesi kapsayıcıdır (`start <= otherEnd && end >= otherStart`):
 * bitiş günü ile ertesi başlangıç günü aynı güne denk gelirse çakışma sayılır —
 * gün granülünde bir kaynak o gün ikiye bölünemez.
 */

export interface CapacityCheckInput {
  kind: ResourceKind;
  requestedPercent: number;
  /** Aynı kaynağa ait, tarih aralığı örtüşen mevcut tahsisler. */
  overlapping: OverlappingAllocation[];
}

export type CapacityVerdict =
  | { ok: true; allocatedPercent: number }
  | {
      ok: false;
      allocatedPercent: number;
      conflicts: OverlappingAllocation[];
    };

/** Bölünemeyen kaynak türleri — tek tahsis bile çakışmadır. */
export function isExclusiveResource(kind: ResourceKind): boolean {
  return (
    kind === ProjectResourceKindSchema.enum.ROOM ||
    kind === ProjectResourceKindSchema.enum.EQUIPMENT
  );
}

/** Oda/cihazda yüzde kavramı yoktur; daima tam kapasite işgal edilir. */
export function normalizeAllocationPercent(
  kind: ResourceKind,
  requested?: number | null
): number {
  if (isExclusiveResource(kind)) return 100;
  return requested ?? 100;
}

export function checkCapacity(input: CapacityCheckInput): CapacityVerdict {
  const allocatedPercent = input.overlapping.reduce(
    (sum, a) => sum + a.allocationPercent,
    0
  );

  if (isExclusiveResource(input.kind)) {
    return input.overlapping.length === 0
      ? { ok: true, allocatedPercent: 0 }
      : { ok: false, allocatedPercent, conflicts: input.overlapping };
  }

  const total = allocatedPercent + input.requestedPercent;
  return total <= 100
    ? { ok: true, allocatedPercent }
    : { ok: false, allocatedPercent, conflicts: input.overlapping };
}

/** İki kapalı tarih aralığı örtüşüyor mu (uç günler dahil). */
export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return (
    aStart.getTime() <= bEnd.getTime() && aEnd.getTime() >= bStart.getTime()
  );
}
