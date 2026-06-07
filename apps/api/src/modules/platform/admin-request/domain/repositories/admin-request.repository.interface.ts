import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/types/find-admin-requests.type';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';

export const ADMIN_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IAdminRequestCommandRepository'
);
export const ADMIN_REQUEST_QUERY_REPOSITORY = Symbol(
  'IAdminRequestQueryRepository'
);

export interface IAdminRequestCommandRepository
  extends IBaseCommandRepository<AdminRequest> {}

export interface IAdminRequestQueryRepository {
  findById(id: string): Promise<AdminRequest | null>;
  findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: AdminRequest[]; total: number }>;
}
