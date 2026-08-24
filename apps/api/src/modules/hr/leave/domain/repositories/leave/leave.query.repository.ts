import { LeaveRequest as ILeaveRequest } from '@shared';
import {
  AnnualLeavePeriod,
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave-request';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAVE_QUERY_REPOSITORY = Symbol('ILeaveQueryRepository');

export interface ILeaveQueryRepository {
  findByEmployee(
    filter: FindLeavesByEmployeeFilter
  ): Promise<Paginated<ILeaveRequest>>;
  findPendingByClinic(
    filter: FindPendingLeavesFilter
  ): Promise<Paginated<ILeaveRequest>>;
  /**
   * Çalışanın aralıkla kesişen onaylı ANNUAL izinleri (yıllık bakiye için). Gün
   * toplamı domain'de hesaplanır — yıl aşan izinler yıllara bölünmeli.
   */
  findApprovedAnnualLeaves(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<AnnualLeavePeriod[]>;
}
