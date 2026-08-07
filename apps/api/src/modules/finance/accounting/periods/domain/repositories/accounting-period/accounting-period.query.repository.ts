import { AccountingPeriod } from '@shared';

export const ACCOUNTING_PERIOD_QUERY_REPOSITORY = Symbol(
  'IAccountingPeriodQueryRepository'
);

export interface IAccountingPeriodQueryRepository {
  findByDate(clinicId: string, date: Date): Promise<AccountingPeriod | null>;
  findAllByClinicId(clinicId: string): Promise<AccountingPeriod[]>;
}
