import { QueryResponse } from '@shared/common/response/response.interface';
import { LeaveRequest } from '@shared';

export type GetPendingLeavesResponse = QueryResponse<LeaveRequest[]>;
