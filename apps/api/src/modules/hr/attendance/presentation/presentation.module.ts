import { Module } from '@nestjs/common';
import { AttendanceQueryController } from '@modules/hr/attendance/presentation/http/controllers/attendance.query.controller';
import { AttendanceCommandController } from '@modules/hr/attendance/presentation/http/controllers/attendance.command.controller';

@Module({ controllers: [AttendanceQueryController, AttendanceCommandController] })
export class AttendancePresentationModule {}
