import { Pagination } from '@shared';
import { User as PrismaUser } from '@prisma/client';
import { MapPaginationResult } from '@src/infrastructure/persistence/prisma/base.repository';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
  PaginatedUsers,
} from '@modules/identity/user/domain/user.contracts';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');
export const USER_QUERY_REPOSITORY = Symbol('IUserQueryRepository');

export interface IUserCommandRepository extends IBaseCommandRepository<User> {
  updateLastLogin(userId: string): Promise<PrismaUser>;
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
  findAllActiveByClinicId(clinicId: string): Promise<User[]>;
  findAllByClinicId(clinicId: string): Promise<User[]>;
  list(
    pagination: Pagination,
    where?: Record<string, unknown>
  ): Promise<MapPaginationResult<User>>;
  listByOrganizationIds(
    data: FindUsersByOrganizationIdsFilter
  ): Promise<PaginatedUsers>;
  listByClinicIds(data: FindUsersByClinicIdsFilter): Promise<PaginatedUsers>;
}
