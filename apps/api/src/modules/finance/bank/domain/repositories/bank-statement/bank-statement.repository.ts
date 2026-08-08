import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BankStatement } from '@modules/finance/bank/domain/entities/bank-statement.entity';
import { BankStatement as IBankStatement } from '@model-schema/BankStatementSchema';
import {
  BankStatementWithLines,
  FindBankStatementsFilter,
  ReconciliationSummary,
} from '@modules/finance/bank/domain/contracts/bank.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const BANK_STATEMENT_COMMAND_REPOSITORY = Symbol(
  'IBankStatementCommandRepository'
);
export const BANK_STATEMENT_QUERY_REPOSITORY = Symbol(
  'IBankStatementQueryRepository'
);

export type IBankStatementCommandRepository =
  IBaseCommandRepository<BankStatement>;

export interface IBankStatementQueryRepository {
  findById(id: string): Promise<IBankStatement | null>;
  findByIdWithLines(id: string): Promise<BankStatementWithLines | null>;
  findByClinic(
    filter: FindBankStatementsFilter
  ): Promise<Paginated<IBankStatement>>;
  reconciliationSummary(
    bankStatementId: string
  ): Promise<ReconciliationSummary>;
}
