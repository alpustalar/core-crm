import { Module } from '@nestjs/common';
import { RequestLeaveHandler } from './request-leave/request-leave.handler';
import { ApproveLeaveHandler } from './approve-leave/approve-leave.handler';
import { RejectLeaveHandler } from './reject-leave/reject-leave.handler';
import { CancelLeaveHandler } from './cancel-leave/cancel-leave.handler';
import { LeaveInfrastructureModule } from '@modules/hr/leave/infrastructure/infrastructure.module';

export const LEAVE_COMMAND_HANDLERS = [
  RequestLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
  CancelLeaveHandler,
];

@Module({
  imports: [LeaveInfrastructureModule],
  providers: LEAVE_COMMAND_HANDLERS,
})
export class LeaveCommandModule {}
