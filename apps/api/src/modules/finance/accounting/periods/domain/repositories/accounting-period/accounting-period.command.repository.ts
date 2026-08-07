import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { AccountingPeriod } from '@modules/finance/accounting/periods/domain/entities/accounting-period.entity';

export const ACCOUNTING_PERIOD_COMMAND_REPOSITORY = Symbol(
  'IAccountingPeriodCommandRepository'
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

    /**
     * Yıl için mevcut dönem (entity). Dönem açma akışında "zaten var mı" kararını
     * beslediği için Command Context'e aittir — replica gecikmesi mükerrer dönem
     * açma denemesine yol açardı (nihai güvence `clinicId_year` unique kısıtı).
     */
    findByYear(
      clinicId: string,
      year: number
    ): Promise<AccountingPeriod | null>;
  };
