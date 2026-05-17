import { Pagination } from '@shared';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';
import { User } from '@prisma/client';
import { UserWithRolePriority } from '@modules/user/domain/types/user-with-role-priority.type';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';
import { UpdateUserProps } from '@modules/user/domain/types/update-user.props';
import { FindUsersByClinicIdsProps } from '@modules/user/domain/types/find-users-by-clinic-ids.props';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { FindUsersByOrganizationIdsProps } from '@modules/user/domain/types/find-users-by-organization-ids.props';
import { PaginatedUsers } from '@modules/user/domain/types/paginated-users.type';

export const USER_REPO_TOKEN = Symbol('IUserRepository');

export interface IUserRepository {
  findByIdOrEmail(userIdOrEmail: string): Promise<UserWithRolePriority | null>;
  find(id: string): Promise<UserWithRolePriority | null>;
  findByEmail(email: string): Promise<UserWithRolePriority | null>;
  findForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  create(user: CreateUserProps): Promise<User>;
  update(id: string, user: UpdateUserProps): Promise<User>;
  changeAllStatusByClinicId(
    clinicId: string,
    status: GlobalStatusType
  ): Promise<{ deletedCount: number }>;
  softDelete(userId: string): Promise<User>;
  softDeleteAllByOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
  list(
    pagination: Pagination,
    where?: Record<string, unknown>
  ): Promise<{
    items: User[];
    total: number;
  }>;
  listByOrganizationIds(
    input: FindUsersByOrganizationIdsProps
  ): Promise<PaginatedUsers>;
  listByClinicIds(input: FindUsersByClinicIdsProps): Promise<PaginatedUsers>;
}
