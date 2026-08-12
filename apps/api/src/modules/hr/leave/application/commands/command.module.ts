import { Module } from '@nestjs/common';
import { RequestLeaveHandler } from './request-leave/request-leave.handler';
import { ApproveLeaveHandler } from './approve-leave/approve-leave.handler';
import { RejectLeaveHandler } from './reject-leave/reject-leave.handler';
import { CancelLeaveHandler } from './cancel-leave/cancel-leave.handler';
import { LeaveInfrastructureModule } from '@modules/hr/leave/infrastructure/infrastructure.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

export const LEAVE_COMMAND_HANDLERS = [
  RequestLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
  CancelLeaveHandler,
];

@Module({
  imports: [LeaveInfrastructureModule, ClinicDomainServicesModule],
  providers: LEAVE_COMMAND_HANDLERS,
})
export class LeaveCommandModule {}
