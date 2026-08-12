import { Module } from '@nestjs/common';
import { LeaveQueryController } from '@modules/hr/leave/presentation/http/controllers/leave.query.controller';
import { LeaveCommandController } from '@modules/hr/leave/presentation/http/controllers/leave.command.controller';

@Module({ controllers: [LeaveQueryController, LeaveCommandController] })
export class LeavePresentationModule {}
