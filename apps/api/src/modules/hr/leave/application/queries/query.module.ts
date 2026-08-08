import { Module } from '@nestjs/common';
import { GetLeavesByEmployeeHandler } from './get-leaves-by-employee/get-leaves-by-employee.handler';
import { GetPendingLeavesHandler } from './get-pending-leaves/get-pending-leaves.handler';
import { GetLeaveBalanceHandler } from './get-leave-balance/get-leave-balance.handler';
import { LeaveRepositoriesModule } from '@modules/hr/leave/infrastructure/persistence/prisma/repositories/repositories.module';

export const LEAVE_QUERY_HANDLERS = [
  GetLeavesByEmployeeHandler,
  GetPendingLeavesHandler,
  GetLeaveBalanceHandler,
];

@Module({
  imports: [LeaveRepositoriesModule],
  providers: LEAVE_QUERY_HANDLERS,
})
export class LeaveQueryModule {}
