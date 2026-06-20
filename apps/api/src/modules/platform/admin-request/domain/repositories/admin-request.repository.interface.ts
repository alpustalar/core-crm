import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { IBaseCommandRepository } from '@common/domain/base-command-repository.interface';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/admin-request.contracts';

export const ADMIN_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IAdminRequestCommandRepository'
);
export const ADMIN_REQUEST_QUERY_REPOSITORY = Symbol(
  'IAdminRequestQueryRepository'
);

export type IAdminRequestCommandRepository =
  IBaseCommandRepository<AdminRequest>;

export interface IAdminRequestQueryRepository {
  findById(id: string): Promise<AdminRequest | null>;
  findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: AdminRequest[]; total: number }>;
}
