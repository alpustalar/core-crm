import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';

export const ATTENDANCE_COMMAND_REPOSITORY = Symbol(
  'IAttendanceCommandRepository'
);

export type IAttendanceCommandRepository =
  IBaseCommandRepository<AttendanceRecord> & {
    findByEmployeeAndDate(
      employeeId: string,
      workDate: Date
    ): Promise<AttendanceRecord | null>;
    /** HR manuel düzeltmesi — çalışan+gün doğal anahtarına göre create-or-update. */
    upsertByEmployeeAndDate(
      entity: AttendanceRecord
    ): Promise<AttendanceRecord>;
  };
