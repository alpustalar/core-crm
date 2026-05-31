import { Pagination } from '@shared';
import { User as PrismaUser } from '@prisma/client';
import { AuthUserResponse } from '@modules/user/domain/types/auth-user-response.type';
import { UpdateUserProps } from '@modules/user/domain/types/update-user.props';
import { FindUsersByClinicIdsProps } from '@modules/user/domain/types/find-users-by-clinic-ids.props';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { FindUsersByOrganizationIdsProps } from '@modules/user/domain/types/find-users-by-organization-ids.props';
import { PaginatedUsers } from '@modules/user/domain/types/paginated-users.type';
import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';
import { User } from '@modules/user/domain/entities/user.entity';
import { CreateUserProps } from '@modules/user/domain/types/create-user.props';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');
export const USER_QUERY_REPOSITORY = Symbol('IUserQueryRepository');

export interface IUserCommandRepository {
  create(user: CreateUserProps): Promise<PrismaUser>;
  update(id: string, user: UpdateUserProps): Promise<PrismaUser>;
  softDelete(userId: string): Promise<PrismaUser>;
  changeAllStatusByClinicId(
    clinicId: string,
    status: GlobalStatusType
  ): Promise<{ ids: string[]; deletedCount: number }>;
  softDeleteAllByOrganizationId(
    organizationId: string
  ): Promise<{ ids: string[]; deletedCount: number }>;
}

export interface IUserQueryRepository {
  findByIdOrEmail(userIdOrEmail: string): Promise<User | null>;
  find(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  list(
    pagination: Pagination,
    where?: Record<string, unknown>
  ): Promise<MapPaginationResult<User>>;
  listByOrganizationIds(
    input: FindUsersByOrganizationIdsProps
  ): Promise<PaginatedUsers>;
  listByClinicIds(input: FindUsersByClinicIdsProps): Promise<PaginatedUsers>;
}
