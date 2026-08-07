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

/**
 * Okuma tarafı: entity değil, plain model / read-model döner.
 * NOT: `find`, `findByEmail`, `findAllActiveByClinicId`, `findAllByClinicId`,
 * `findAllByStatusWithClinicId` hiçbir yerden çağrılmıyordu — kaldırıldı.
 */
export interface IUserQueryRepository {
  findByIdOrEmail(userIdOrEmail: string): Promise<IUser | null>;
  findForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  /** Bir klinikte bildirim alacak aktif personel (çalışan + yönetici) userId'leri. */
  findActiveStaffUserIdsByClinicId(clinicId: string): Promise<string[]>;
  listByOrganizationIds(
    data: FindUsersByOrganizationIdsFilter
  ): Promise<Paginated<IUser>>;
  listByClinicIds(data: FindUsersByClinicIdsFilter): Promise<Paginated<IUser>>;
}
