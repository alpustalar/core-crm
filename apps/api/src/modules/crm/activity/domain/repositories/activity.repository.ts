import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';
import { Activity as IActivity } from '@shared';
import {
  FindActivitiesByLeadFilter,
  FindMyTasksFilter,
} from '@modules/crm/activity/domain/contracts/activity.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const ACTIVITY_COMMAND_REPOSITORY = Symbol('IActivityCommandRepository');
export const ACTIVITY_QUERY_REPOSITORY = Symbol('IActivityQueryRepository');

export interface IActivityCommandRepository extends IBaseCommandRepository<Activity> {
  /** Aktivite kalıcı silme (soft-delete yok — düşük değerli CRM kaydı). */
  deleteById(id: string): Promise<void>;
}

export interface IActivityQueryRepository {
  findById(id: string): Promise<IActivity | null>;
  /** Bir lead'in aktivite zaman çizelgesi (yeni → eski). */
  findByLead(filter: FindActivitiesByLeadFilter): Promise<Paginated<IActivity>>;
  /** Aktöre atanmış açık görevler/aramalar/toplantılar (NOTE hariç). */
  findMyTasks(filter: FindMyTasksFilter): Promise<Paginated<IActivity>>;
}
