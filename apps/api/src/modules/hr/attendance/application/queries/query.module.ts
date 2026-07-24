import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AttendanceRepositoryModule } from '@modules/hr/attendance/infrastructure/persistence/prisma/repositories/attendance.repository.module';
import { GetAttendanceByEmployeeHandler } from './get-attendance-by-employee/get-attendance-by-employee.handler';
import { GetAttendanceSummaryHandler } from './get-attendance-summary/get-attendance-summary.handler';

export const ATTENDANCE_QUERY_HANDLERS = [
  GetAttendanceByEmployeeHandler,
  GetAttendanceSummaryHandler,
];

@Module({
  imports: [CqrsModule, AttendanceRepositoryModule],
  providers: ATTENDANCE_QUERY_HANDLERS,
  exports: ATTENDANCE_QUERY_HANDLERS,
})
export class AttendanceQueryModule {}
