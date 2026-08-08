import { Module } from '@nestjs/common';
import { LeaveController } from '@modules/hr/leave/presentation/http/controllers/leave.controller';

@Module({ controllers: [LeaveController] })
export class LeavePresentationModule {}
