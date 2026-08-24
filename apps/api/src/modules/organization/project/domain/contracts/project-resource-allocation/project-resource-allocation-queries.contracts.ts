import { ProjectResourceKindType as ResourceKind } from '@input-type-schemas/ProjectResourceKindSchema';

/** Çakışma kontrolü için mevcut tahsis penceresi (yalnız gereken alanlar). */
export interface OverlappingAllocation {
  id: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  allocationPercent: number;
}

export interface FindOverlappingAllocationsProps {
  clinicId: string;
  kind: ResourceKind;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  /** Güncelleme akışında kendi kaydını çakışma saymamak için hariç tutulur. */
  excludeAllocationId?: string;
}

/** Kaynak takvimi satırı — bir kaynağın hangi projeye ne kadar ayrıldığı. */
export interface ResourceScheduleRow {
  allocationId: string;
  projectId: string;
  projectName: string;
  phaseId: string | null;
  kind: ResourceKind;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  allocationPercent: number;
  note: string | null;
}

export interface FindResourceScheduleFilter {
  clinicId: string;
  kind?: ResourceKind;
  resourceId?: string;
  from: Date;
  to: Date;
}
