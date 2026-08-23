import { Module } from '@nestjs/common';
import { RequestLeaveHandler } from './request-leave/request-leave.handler';
import { ApproveLeaveHandler } from './approve-leave/approve-leave.handler';
import { RejectLeaveHandler } from './reject-leave/reject-leave.handler';
import { CancelLeaveHandler } from './cancel-leave/cancel-leave.handler';
import { LeaveInfrastructureModule } from '@modules/hr/leave/infrastructure/infrastructure.module';
import { EmployeeDomainServicesModule } from '@modules/hr/employee/domain/services/services.module';

export const LEAVE_COMMAND_HANDLERS = [
  RequestLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
  CancelLeaveHandler,
];

@Module({
  // Yaprak domain-servis modülü — `EmployeeModule` DEĞİL (controller'ları ve tüm
  // handler'ları da beraberinde çekerdi).
  imports: [LeaveInfrastructureModule, EmployeeDomainServicesModule],
  providers: LEAVE_COMMAND_HANDLERS,
})
export class LeaveCommandModule {}
