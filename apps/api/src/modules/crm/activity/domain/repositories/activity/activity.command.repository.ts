import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';

export const ACTIVITY_COMMAND_REPOSITORY = Symbol('IActivityCommandRepository');

export interface IActivityCommandRepository
  extends IBaseCommandRepository<Activity> {
  /** Aktivite kalıcı silme (soft-delete yok — düşük değerli CRM kaydı). */
  deleteById(id: string): Promise<void>;
}
