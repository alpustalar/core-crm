import { AccountingPeriod } from '../entities/accounting-period.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const ACCOUNTING_PERIOD_COMMAND_REPOSITORY = Symbol(
  'IAccountingPeriodCommandRepository'
);
export const ACCOUNTING_PERIOD_QUERY_REPOSITORY = Symbol(
  'IAccountingPeriodQueryRepository'
);

export type IAccountingPeriodCommandRepository =
  IBaseCommandRepository<AccountingPeriod> & {
    /**
     * Dönemi atomik olarak kapanışa "sahiplenir": OPEN/LOCKED → CLOSED tek bir
     * koşullu UPDATE ile yapılır. Eşzamanlı ikinci istek 0 satır etkiler (satır
     * kilidi commit'i bekler, sonra CLOSED görür) → `false` döner. Böylece mükerrer
     * yıl sonu kapanış fişi üretimi (check-then-act yarışı) önlenir.
     * @returns dönemi bu çağrı kapattıysa `true`, zaten kapalıysa `false`
     */
    claimForClosing(periodId: string): Promise<boolean>;
  };

export interface IAccountingPeriodQueryRepository {
  findById(id: string): Promise<AccountingPeriod | null>;
  findByYear(clinicId: string, year: number): Promise<AccountingPeriod | null>;
  findByDate(clinicId: string, date: Date): Promise<AccountingPeriod | null>;
  findAllByClinicId(clinicId: string): Promise<AccountingPeriod[]>;
}
