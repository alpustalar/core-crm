import { LeaveRequest as ILeaveRequest } from '@shared';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import {
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAVE_COMMAND_REPOSITORY = Symbol('ILeaveCommandRepository');
export const LEAVE_QUERY_REPOSITORY = Symbol('ILeaveQueryRepository');

export interface ILeaveCommandRepository
  extends IBaseCommandRepository<LeaveRequest> {
  /**
   * Çalışanın dönem içi onaylı ANNUAL izin gün toplamı. Onay kararını (bakiye
   * yeterli mi) beslediği için Command Context'te okunur; raporlama kopyası
   * Query Repo'dadır.
   */
  sumApprovedAnnualDays(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<number>;
}

/**
 * Okuma tarafı: entity değil, plain model döner.
 * NOT: `findById` hiçbir handler tarafından kullanılmıyordu — kaldırıldı.
 */
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
