import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';

export const BANK_STATEMENT_LINE_COMMAND_REPOSITORY = Symbol(
  'IBankStatementLineCommandRepository'
);

export type IBankStatementLineCommandRepository =
  IBaseCommandRepository<BankStatementLine>;
