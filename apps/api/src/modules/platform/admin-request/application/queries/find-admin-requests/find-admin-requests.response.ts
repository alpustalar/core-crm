import { QueryResponse } from '@shared/common/response/response.interface';
import { AdminRequest } from '@modules/platform/admin-request/domain/entities/admin-request.entity';

export type FindAdminRequestsResponse = QueryResponse<{
  items: AdminRequest[];
  total: number;
}>;
