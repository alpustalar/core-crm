import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AnnualLeavePeriod } from '@modules/hr/leave/domain/contracts/leave-request';

export const LEAVE_COMMAND_REPOSITORY = Symbol('ILeaveCommandRepository');

export interface ILeaveCommandRepository
  extends IBaseCommandRepository<LeaveRequest> {
  /** İzin talebini `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde. */
  findByIdForUpdate(id: string): Promise<LeaveRequest | null>;

  /**
   * Çalışanın verilen aralıkla **kesişen** onaylı ANNUAL izinleri. Onay kararını
   * (bakiye yeterli mi) beslediği için Command Context'te okunur; raporlama kopyası
   * Query Repo'dadır.
   *
   * Gün toplamı DB'de değil domain'de hesaplanır (`LeaveBalance.accrue`): yıl aşan
   * izinlerin günleri yıllara bölünmeli, bu da SQL `SUM`'ın ifade edemeyeceği bir
   * kural. Bu yüzden metot toplam değil **aralık** döndürür.
   */
  findApprovedAnnualLeaves(
    employeeId: string,
    from: Date,
    to: Date
  ): Promise<AnnualLeavePeriod[]>;
}
