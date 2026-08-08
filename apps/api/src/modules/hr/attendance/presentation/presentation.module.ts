import { Module } from '@nestjs/common';
import { AttendanceController } from '@modules/hr/attendance/presentation/http/controllers/attendance.controller';

@Module({ controllers: [AttendanceController] })
export class AttendancePresentationModule {}
