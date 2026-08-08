import { Module } from '@nestjs/common';
import { GetAttendanceByEmployeeHandler } from './get-attendance-by-employee/get-attendance-by-employee.handler';
import { GetAttendanceSummaryHandler } from './get-attendance-summary/get-attendance-summary.handler';
import { AttendanceInfrastructureModule } from '@modules/hr/attendance/infrastructure/infrastructure.module';

export const ATTENDANCE_QUERY_HANDLERS = [
  GetAttendanceByEmployeeHandler,
  GetAttendanceSummaryHandler,
];

@Module({
  imports: [AttendanceInfrastructureModule],
  providers: ATTENDANCE_QUERY_HANDLERS,
})
export class AttendanceQueryModule {}
