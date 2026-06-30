import { QueryResponse } from '@shared/common/response/response.interface';
import { AdminRequest } from '@shared';

export type FindAdminRequestsResponse = QueryResponse<AdminRequest[]>;
