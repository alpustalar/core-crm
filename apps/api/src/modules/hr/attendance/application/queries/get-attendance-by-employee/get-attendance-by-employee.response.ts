import { QueryResponse } from '@shared/common/response/response.interface';
import { AttendanceRecord } from '@shared';

export type GetAttendanceByEmployeeResponse = QueryResponse<AttendanceRecord[]>;
