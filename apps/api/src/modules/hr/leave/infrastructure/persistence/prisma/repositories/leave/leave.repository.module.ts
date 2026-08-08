import { Module } from '@nestjs/common';
import {
  LEAVE_COMMAND_REPOSITORY,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import { LeaveRequestCommandRepository } from './leave-request.command.repository';
import { LeaveRequestQueryRepository } from './leave-request.query.repository';

@Module({
  providers: [
    { provide: LEAVE_COMMAND_REPOSITORY, useClass: LeaveRequestCommandRepository },
    { provide: LEAVE_QUERY_REPOSITORY, useClass: LeaveRequestQueryRepository },
  ],
  exports: [LEAVE_COMMAND_REPOSITORY, LEAVE_QUERY_REPOSITORY],
})
export class LeaveRepositoryModule {}
