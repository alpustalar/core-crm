import {
  FindResourceScheduleFilter,
  ResourceScheduleRow,
} from '@modules/organization/project/domain/contracts/project.contracts';

export const PROJECT_RESOURCE_ALLOCATION_QUERY_REPOSITORY = Symbol(
  'IProjectResourceAllocationQueryRepository'
);

/** Okuma tarafı: entity değil, read-model döner. */
export interface IProjectResourceAllocationQueryRepository {
  /** Kaynak takvimi — verilen aralıkta kim/ne hangi projeye ne kadar ayrılmış. */
  findSchedule(
    filter: FindResourceScheduleFilter
  ): Promise<ResourceScheduleRow[]>;
}
