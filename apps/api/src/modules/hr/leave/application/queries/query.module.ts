import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LeaveRepositoryModule } from '@modules/hr/leave/infrastructure/persistence/prisma/repositories/leave.repository.module';
import { GetLeavesByEmployeeHandler } from './get-leaves-by-employee/get-leaves-by-employee.handler';
import { GetPendingLeavesHandler } from './get-pending-leaves/get-pending-leaves.handler';
import { GetLeaveBalanceHandler } from './get-leave-balance/get-leave-balance.handler';

export const LEAVE_QUERY_HANDLERS = [
  GetLeavesByEmployeeHandler,
  GetPendingLeavesHandler,
  GetLeaveBalanceHandler,
];

@Module({
  imports: [CqrsModule, LeaveRepositoryModule],
  providers: LEAVE_QUERY_HANDLERS,
  exports: LEAVE_QUERY_HANDLERS,
})
export class LeaveQueryModule {}
