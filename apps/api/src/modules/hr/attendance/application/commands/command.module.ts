import { Module } from '@nestjs/common';
import { CheckInHandler } from './check-in/check-in.handler';
import { CheckOutHandler } from './check-out/check-out.handler';
import { RecordAttendanceHandler } from './record-attendance/record-attendance.handler';
import { AttendanceInfrastructureModule } from '@modules/hr/attendance/infrastructure/infrastructure.module';

export const ATTENDANCE_COMMAND_HANDLERS = [
  CheckInHandler,
  CheckOutHandler,
  RecordAttendanceHandler,
];

@Module({
  imports: [AttendanceInfrastructureModule],
  providers: ATTENDANCE_COMMAND_HANDLERS,
})
export class AttendanceCommandModule {}
