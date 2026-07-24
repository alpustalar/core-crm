import { QueryResponse } from '@shared/common/response/response.interface';
import { AttendanceSummary } from '@modules/hr/attendance/domain/contracts/attendance.contracts';

export type GetAttendanceSummaryResponse = QueryResponse<AttendanceSummary>;
