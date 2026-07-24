import { Module } from '@nestjs/common';
import { LeaveController } from './controllers/leave.controller';
import { LeaveCommandModule } from '@modules/hr/leave/application/commands/command.module';
import { LeaveQueryModule } from '@modules/hr/leave/application/queries/query.module';

@Module({
  imports: [LeaveCommandModule, LeaveQueryModule],
  controllers: [LeaveController],
})
export class LeavePresentationModule {}
