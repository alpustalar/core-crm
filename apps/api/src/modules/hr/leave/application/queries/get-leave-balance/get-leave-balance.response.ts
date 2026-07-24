import { QueryResponse } from '@shared/common/response/response.interface';
import { LeaveBalance } from '@modules/hr/leave/domain/contracts/leave.contracts';

export type GetLeaveBalanceResponse = QueryResponse<LeaveBalance>;
