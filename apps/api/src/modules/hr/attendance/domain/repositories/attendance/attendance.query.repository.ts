import type { AttendanceRecord } from '@shared';
import {
  AttendanceSummary,
  FindAttendanceByEmployeeFilter,
  GetAttendanceSummaryFilter,
} from '@modules/hr/attendance/domain/contracts/attendance.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const ATTENDANCE_QUERY_REPOSITORY = Symbol('IAttendanceQueryRepository');

export interface IAttendanceQueryRepository {
  findByEmployee(
    filter: FindAttendanceByEmployeeFilter
  ): Promise<Paginated<AttendanceRecord>>;
  getSummary(filter: GetAttendanceSummaryFilter): Promise<AttendanceSummary>;
}
