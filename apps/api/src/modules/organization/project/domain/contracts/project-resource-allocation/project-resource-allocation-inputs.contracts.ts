import { ProjectResourceKindType as ResourceKind } from '@input-type-schemas/ProjectResourceKindSchema';

// ==========================================
// KAYNAK TAHSİSİ (RESOURCE ALLOCATION)
// ==========================================
// allocationPercent 1-100 aralığı HTTP sınırında (AllocateProjectResourceSchema,
// @shared/modules/project) zaten doğrulanır; domain katmanı tekrar etmez.
// startDate < endDate kuralı entity.create() içinde koşulur (bkz.
// project-resource-allocation.entity.ts).

export interface AllocateProjectResourceProps {
  id?: string;
  projectId: string;
  phaseId?: string | null;
  clinicId: string;
  kind: ResourceKind;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  allocationPercent?: number;
  note?: string | null;
  createdById: string;
}

/** Kapasite çapa kilidi girdisi — kilitlenecek tablo `kind`'a göre seçilir. */
export interface LockResourceCapacityProps {
  kind: ResourceKind;
  resourceId: string;
}
