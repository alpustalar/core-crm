import { UserStatusType } from '@input-type-schemas/UserStatusSchema';
import { Prisma, User } from '@prisma/client';
import { Pagination } from '@shared';
import { authUserInclude } from '@modules/user/infrastructure/persistence/prisma/repositories/user.repository';

export type IUser = User;
export type IUserStatus = UserStatusType;
export type IUserCreate = Prisma.UserCreateInput;
export type IUserUpdate = Prisma.UserUpdateInput;

export interface FindUsersByOrganizationIdsInput {
  pagination: Pagination;
  organizationId: string | string[];
  extraWhere?: Prisma.UserWhereInput;
  select?: Prisma.UserSelect;
}

export interface FindUsersByClinicIdsInput {
  pagination: Pagination;
  clinicId: string | string[];
  extraWhere?: Prisma.UserWhereInput;
  select?: Prisma.UserSelect;
}

export type PaginatedUsers = {
  items: IUser[];
  total: number;
};

export type AuthUserResponse = Prisma.UserGetPayload<{
  include: typeof authUserInclude;
}>;

export const USER_REPO_TOKEN = Symbol('IUserRepository');

export interface IUserRepository {
  findOneWithAnIdOrEmail(userIdOrEmail: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findUserForAuth(
    where: Prisma.UserWhereInput
  ): Promise<AuthUserResponse | null>;
  checkEmailExists(email: string): Promise<number>;
  createUser(user: IUserCreate): Promise<IUser>;
  updateUserWithAnId(id: string, user: IUserUpdate): Promise<IUser>;
  changeAllUserStatusInClinicWithClinicId(
    clinicId: string,
    status: IUserStatus
  ): Promise<{ deletedCount: number }>;
  softDeleteUserWithAnId(userId: string): Promise<IUser>;
  softDeleteAllUsersByOrganizationId(
    organizationId: string
  ): Promise<{ deletedCount: number }>;
  findAllUsers(
    pagination: any,
    where?: any
  ): Promise<{
    items: IUser[];
    total: number;
  }>;
  findUsersByOrganizationIds(
    input: FindUsersByOrganizationIdsInput
  ): Promise<PaginatedUsers>;
  findUsersByClinicIds(
    input: FindUsersByClinicIdsInput
  ): Promise<PaginatedUsers>;
}
