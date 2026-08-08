import { User as IUser } from '@shared';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
} from '@modules/identity/user/domain/contracts/user.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const USER_QUERY_REPOSITORY = Symbol('IUserQueryRepository');

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
