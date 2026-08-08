import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BankAccount } from '@modules/finance/bank/domain/entities/bank-account.entity';
import { BankAccount as IBankAccount } from '@model-schema/BankAccountSchema';
import { FindBankAccountsFilter } from '@modules/finance/bank/domain/contracts/bank.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const BANK_ACCOUNT_COMMAND_REPOSITORY = Symbol(
  'IBankAccountCommandRepository'
);

export type IBankAccountCommandRepository = IBaseCommandRepository<BankAccount>;
