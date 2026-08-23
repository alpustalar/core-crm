import { ProjectResourceAllocation } from '@modules/organization/project/domain/entities/project-resource-allocation.entity';
import {
  FindOverlappingAllocationsProps,
  LockResourceCapacityProps,
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
   * Kapasite hesabını **serialize eden çapa kilidi**.
   *
   * Kapasite tek satırda durmaz (örtüşen tahsislerin toplamıdır); kilitlenecek
   * tek satır olmadığı için kaynağın kendi satırı çapa olarak kilitlenir.
   * Aksi halde iki eşzamanlı tahsis isteği de "yer var" görür ve aynı personeli
   * %150'ye çıkarır — aynı transaction'da olmaları bunu engellemez.
   *
   * Veri okumaz; `findOverlapping`'ten ÖNCE çağrılır.
   */
  lockResourceCapacity(props: LockResourceCapacityProps): Promise<void>;

  /**
   * Kapasite kararını besleyen okuma → Command Context. Aynı kaynağın tarih
   * aralığı örtüşen mevcut tahsisleri; `checkCapacity` bunun üzerinden karar verir.
   */
  findOverlapping(
    props: FindOverlappingAllocationsProps
  ): Promise<OverlappingAllocation[]>;
}
