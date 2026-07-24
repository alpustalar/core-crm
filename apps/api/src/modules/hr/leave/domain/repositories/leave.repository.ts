import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import {
  FindLeavesByEmployeeFilter,
  FindPendingLeavesFilter,
} from '@modules/hr/leave/domain/contracts/leave.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const LEAVE_COMMAND_REPOSITORY = Symbol('ILeaveCommandRepository');
export const LEAVE_QUERY_REPOSITORY = Symbol('ILeaveQueryRepository');

export type ILeaveCommandRepository = IBaseCommandRepository<LeaveRequest>;

export interface ILeaveQueryRepository {
  findById(id: string): Promise<LeaveRequest | null>;
  findByEmployee(
    filter: FindLeavesByEmployeeFilter
  ): Promise<Paginated<LeaveRequest>>;
  findPendingByClinic(
    filter: FindPendingLeavesFilter
  ): Promise<Paginated<LeaveRequest>>;
  /** Çalışanın dönem içi onaylı ANNUAL izin gün toplamı (yıllık bakiye için). */
  sumApprovedAnnualDays(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<number>;
}
