import { Module } from '@nestjs/common';
import { AttendanceRecordCommandRepository } from './attendance-record.command.repository';
import { AttendanceRecordQueryRepository } from './attendance-record.query.repository';
import { ATTENDANCE_COMMAND_REPOSITORY } from '@modules/hr/attendance/domain/repositories/attendance/attendance.command.repository';
import { ATTENDANCE_QUERY_REPOSITORY } from '@modules/hr/attendance/domain/repositories/attendance/attendance.query.repository';

@Module({
  providers: [
    {
      provide: ATTENDANCE_COMMAND_REPOSITORY,
      useClass: AttendanceRecordCommandRepository,
    },
    {
      provide: ATTENDANCE_QUERY_REPOSITORY,
      useClass: AttendanceRecordQueryRepository,
    },
  ],
  exports: [ATTENDANCE_COMMAND_REPOSITORY, ATTENDANCE_QUERY_REPOSITORY],
})
export class AttendanceRecordRepositoryModule {}
