import { ProjectResourceAllocation } from '@modules/organization/project/domain/entities/project-resource-allocation.entity';
import {
  FindOverlappingAllocationsProps,
  OverlappingAllocation,
} from '@modules/organization/project/domain/contracts/project.contracts';

export const PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY = Symbol(
  'IProjectResourceAllocationCommandRepository'
);

export interface IProjectResourceAllocationCommandRepository {
  create(entity: ProjectResourceAllocation): Promise<ProjectResourceAllocation>;
  findById(id: string): Promise<ProjectResourceAllocation | null>;
  delete(id: string): Promise<void>;

  /**
   * Kapasite kararını besleyen okuma → Command Context. Aynı kaynağın tarih
   * aralığı örtüşen mevcut tahsisleri; `checkCapacity` bunun üzerinden karar verir.
   */
  findOverlapping(
    props: FindOverlappingAllocationsProps
  ): Promise<OverlappingAllocation[]>;
}
