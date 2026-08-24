import { QueryResponse } from '@shared/common/response/response.interface';
import { AttendanceSummary } from '@modules/hr/attendance/domain/contracts/attendance-record';

export type GetAttendanceSummaryResponse = QueryResponse<AttendanceSummary>;
