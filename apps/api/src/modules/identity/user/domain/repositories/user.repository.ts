import { Pagination } from '@shared';
import { User as PrismaUser } from '@prisma/client';
import { User } from '@modules/identity/user/domain/entities/user.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import {
  AuthUserResponse,
  FindUsersByClinicIdsFilter,
  FindUsersByOrganizationIdsFilter,
} from '@modules/identity/user/domain/user.contracts';
import { GlobalStatusType } from '@input-type-schemas/GlobalStatusSchema';
import { Paginated } from '@common/interfaces/paginated.type';

export const USER_COMMAND_REPOSITORY = Symbol('IUserCommandRepository');
export const USER_QUERY_REPOSITORY = Symbol('IUserQueryRepository');

export interface IUserCommandRepository extends IBaseCommandRepository<User> {
  updateLastLogin(userId: string): Promise<PrismaUser>;
  softDeleteAllByClinicIds(
    clinicId: string[] | string
  ): Promise<{ ids: string[]; deletedCount: number }>;
  changeStatus(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<{ ids: string[]; deletedCount: number }>;
}

export interface IUserQueryRepository {
  findByIdOrEmail(userIdOrEmail: string): Promise<User | null>;
  find(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findForAuth(firebaseUid: string): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  findAllActiveByClinicId(clinicId: string): Promise<Paginated<User>>;
  findAllByStatusWithClinicId(
    status: GlobalStatusType,
    clinicId: string
  ): Promise<Paginated<User>>;
  findAllByClinicId(clinicId: string): Promise<Paginated<User>>;
  list(
    pagination: Pagination,
    where?: Record<string, unknown>
  ): Promise<Paginated<User>>;
  listByOrganizationIds(
    data: FindUsersByOrganizationIdsFilter
  ): Promise<Paginated<User>>;
  listByClinicIds(data: FindUsersByClinicIdsFilter): Promise<Paginated<User>>;
}
