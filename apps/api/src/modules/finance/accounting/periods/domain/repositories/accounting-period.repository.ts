import { AccountingPeriod } from '../entities/accounting-period.entity';

export const ACCOUNTING_PERIOD_COMMAND_REPOSITORY = Symbol(
  'IAccountingPeriodCommandRepository'
);
export const ACCOUNTING_PERIOD_QUERY_REPOSITORY = Symbol(
  'IAccountingPeriodQueryRepository'
);

export interface IAccountingPeriodCommandRepository {
  save(period: AccountingPeriod): Promise<AccountingPeriod>;
}

export interface IAccountingPeriodQueryRepository {
  findById(id: string): Promise<AccountingPeriod | null>;
  findByYear(
    organizationId: string,
    year: number
  ): Promise<AccountingPeriod | null>;
  findByDate(
    organizationId: string,
    date: Date
  ): Promise<AccountingPeriod | null>;
  findAllByOrganizationId(organizationId: string): Promise<AccountingPeriod[]>;
}
