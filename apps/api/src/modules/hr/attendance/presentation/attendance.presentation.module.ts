import { Module } from '@nestjs/common';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceCommandModule } from '@modules/hr/attendance/application/commands/command.module';
import { AttendanceQueryModule } from '@modules/hr/attendance/application/queries/query.module';

@Module({
  imports: [AttendanceCommandModule, AttendanceQueryModule],
  controllers: [AttendanceController],
})
export class AttendancePresentationModule {}
