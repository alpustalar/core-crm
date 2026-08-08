import { LeaveRequest as ILeaveRequest } from '@shared';
import {
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAVE_QUERY_REPOSITORY = Symbol('ILeaveQueryRepository');

export interface ILeaveQueryRepository {
  findByEmployee(
    filter: FindLeavesByEmployeeFilter
  ): Promise<Paginated<ILeaveRequest>>;
  findPendingByClinic(
    filter: FindPendingLeavesFilter
  ): Promise<Paginated<ILeaveRequest>>;
  /** Çalışanın dönem içi onaylı ANNUAL izin gün toplamı (yıllık bakiye için). */
  sumApprovedAnnualDays(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<number>;
}
