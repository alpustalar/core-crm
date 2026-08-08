import { User as IUser } from '@shared';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { User } from '@modules/identity/user/domain/entities/user.entity';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');

export interface IUserCommandRepository extends IBaseCommandRepository<User> {
  updateLastLogin(userId: string): Promise<IUser>;
  softDeleteAllByClinicIds(
    clinicId: string[] | string
  ): Promise<{ deletedCount: number }>;
  changeStatus(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<{ affectedCount: number }>;
}
