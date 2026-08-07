import { AttendanceRecord as IAttendanceRecord } from '@shared';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AttendanceRecord } from '@modules/hr/attendance/domain/entities/attendance-record.entity';
import {
  AttendanceSummary,
  FindAttendanceByEmployeeFilter,
  GetAttendanceSummaryFilter,
} from '@modules/hr/attendance/domain/contracts/attendance.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const ATTENDANCE_COMMAND_REPOSITORY = Symbol(
  'IAttendanceCommandRepository'
);
export const ATTENDANCE_QUERY_REPOSITORY = Symbol('IAttendanceQueryRepository');

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

/**
 * Okuma tarafı: entity değil, plain model / read-model döner.
 * NOT: `findById` hiçbir handler tarafından kullanılmıyordu — kaldırıldı.
 */
export interface IAttendanceQueryRepository {
  findByEmployee(
    filter: FindAttendanceByEmployeeFilter
  ): Promise<Paginated<IAttendanceRecord>>;
  getSummary(filter: GetAttendanceSummaryFilter): Promise<AttendanceSummary>;
}
