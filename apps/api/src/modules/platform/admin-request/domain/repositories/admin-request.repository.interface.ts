import { AdminRequest as IAdminRequest } from '@shared';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/admin-request.contracts';

export const ADMIN_REQUEST_COMMAND_REPOSITORY = Symbol(
  'IAdminRequestCommandRepository'
);
export const ADMIN_REQUEST_QUERY_REPOSITORY = Symbol(
  'IAdminRequestQueryRepository'
);

export type IAdminRequestCommandRepository =
  IBaseCommandRepository<AdminRequest>;

/**
 * Okuma tarafı: entity değil, plain model döner.
 * NOT: İncelenecek isteği yükleyen `findById` Command Repo'ya taşındı (mutasyon).
 */
export interface IAdminRequestQueryRepository {
  findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: IAdminRequest[]; total: number }>;
}
