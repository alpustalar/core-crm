import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LeaveRepositoryModule } from '@modules/hr/leave/infrastructure/persistence/prisma/repositories/leave.repository.module';
import { RequestLeaveHandler } from './request-leave/request-leave.handler';
import { ApproveLeaveHandler } from './approve-leave/approve-leave.handler';
import { RejectLeaveHandler } from './reject-leave/reject-leave.handler';
import { CancelLeaveHandler } from './cancel-leave/cancel-leave.handler';

export const LEAVE_COMMAND_HANDLERS = [
  RequestLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
  CancelLeaveHandler,
];

@Module({
  imports: [CqrsModule, LeaveRepositoryModule],
  providers: LEAVE_COMMAND_HANDLERS,
  exports: LEAVE_COMMAND_HANDLERS,
})
export class LeaveCommandModule {}
