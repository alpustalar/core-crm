import { Module } from '@nestjs/common';
import {
  ATTENDANCE_COMMAND_REPOSITORY,
  ATTENDANCE_QUERY_REPOSITORY,
} from '@modules/hr/attendance/domain/repositories/attendance.repository';
import { AttendanceRecordCommandRepository } from './attendance-record.command.repository';
import { AttendanceRecordQueryRepository } from './attendance-record.query.repository';

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
export class AttendanceRepositoryModule {}
