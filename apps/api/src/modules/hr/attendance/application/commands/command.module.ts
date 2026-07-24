import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AttendanceRepositoryModule } from '@modules/hr/attendance/infrastructure/persistence/prisma/repositories/attendance.repository.module';
import { CheckInHandler } from './check-in/check-in.handler';
import { CheckOutHandler } from './check-out/check-out.handler';
import { RecordAttendanceHandler } from './record-attendance/record-attendance.handler';

export const ATTENDANCE_COMMAND_HANDLERS = [
  CheckInHandler,
  CheckOutHandler,
  RecordAttendanceHandler,
];

@Module({
  imports: [CqrsModule, AttendanceRepositoryModule],
  providers: ATTENDANCE_COMMAND_HANDLERS,
  exports: ATTENDANCE_COMMAND_HANDLERS,
})
export class AttendanceCommandModule {}
