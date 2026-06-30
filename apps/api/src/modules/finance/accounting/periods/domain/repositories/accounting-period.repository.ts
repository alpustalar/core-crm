import { AccountingPeriod } from '../entities/accounting-period.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const ACCOUNTING_PERIOD_COMMAND_REPOSITORY = Symbol(
  'IAccountingPeriodCommandRepository'
);
export const ACCOUNTING_PERIOD_QUERY_REPOSITORY = Symbol(
  'IAccountingPeriodQueryRepository'
);

export type IAccountingPeriodCommandRepository =
  IBaseCommandRepository<AccountingPeriod>;

export interface IAccountingPeriodQueryRepository {
  findById(id: string): Promise<AccountingPeriod | null>;
  findByYear(clinicId: string, year: number): Promise<AccountingPeriod | null>;
  findByDate(clinicId: string, date: Date): Promise<AccountingPeriod | null>;
  findAllByClinicId(clinicId: string): Promise<AccountingPeriod[]>;
}
