import { Activity } from '@shared';
import {
  FindActivitiesByLeadFilter,
  FindMyTasksFilter,
} from '@modules/crm/activity/domain/contracts/activity.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const ACTIVITY_QUERY_REPOSITORY = Symbol('IActivityQueryRepository');

export interface IActivityQueryRepository {
  findById(id: string): Promise<Activity | null>;
  /** Bir lead'in aktivite zaman çizelgesi (yeni → eski). */
  findByLead(filter: FindActivitiesByLeadFilter): Promise<Paginated<Activity>>;
  /** Aktöre atanmış açık görevler/aramalar/toplantılar (NOTE hariç). */
  findMyTasks(filter: FindMyTasksFilter): Promise<Paginated<Activity>>;
}
