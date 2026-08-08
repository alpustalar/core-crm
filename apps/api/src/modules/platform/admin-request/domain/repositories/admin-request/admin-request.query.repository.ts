import { AdminRequest as IAdminRequest } from '@shared';
import { FindAdminRequestsFilter } from '@modules/platform/admin-request/domain/contracts/admin-request.contracts';

export const ADMIN_REQUEST_QUERY_REPOSITORY = Symbol(
  'IAdminRequestQueryRepository'
);

export interface IAdminRequestQueryRepository {
  findMany(
    filter: FindAdminRequestsFilter
  ): Promise<{ items: IAdminRequest[]; total: number }>;
}
