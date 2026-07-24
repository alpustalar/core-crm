import { User as IUser } from '@shared';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
} from '@modules/identity/user/domain/contracts/user.contracts';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { Paginated } from '@common/interfaces/paginated.type';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');
export const USER_QUERY_REPOSITORY = Symbol('IUserQueryRepository');

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

export interface IUserQueryRepository {
  findByIdOrEmail(userIdOrEmail: string): Promise<User | null>;
  find(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  findAllActiveByClinicId(clinicId: string): Promise<Paginated<User>>;
  /** Bir klinikte bildirim alacak aktif personel (çalışan + yönetici) userId'leri. */
  findActiveStaffUserIdsByClinicId(clinicId: string): Promise<string[]>;
  findAllByStatusWithClinicId(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<Paginated<User>>;
  findAllByClinicId(clinicId: string): Promise<Paginated<User>>;
  listByOrganizationIds(
    data: FindUsersByOrganizationIdsFilter
  ): Promise<Paginated<User>>;
  listByClinicIds(data: FindUsersByClinicIdsFilter): Promise<Paginated<User>>;
}
