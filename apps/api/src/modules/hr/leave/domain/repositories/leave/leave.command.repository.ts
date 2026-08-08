import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const LEAVE_COMMAND_REPOSITORY = Symbol('ILeaveCommandRepository');

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
