import { Module } from '@nestjs/common';
import { LeavePresentationModule } from './presentation/leave.presentation.module';
import { LeaveCommandModule } from './application/commands/command.module';
import { LeaveQueryModule } from './application/queries/query.module';

@Module({
  imports: [LeavePresentationModule, LeaveCommandModule, LeaveQueryModule],
  exports: [LeaveCommandModule, LeaveQueryModule],
})
export class LeaveModule {}
