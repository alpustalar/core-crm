import { BankAccount } from '@model-schema/BankAccountSchema';
import { FindBankAccountsFilter } from '@modules/finance/bank/domain/contracts';
import { Paginated } from '@common/interfaces/paginated.type';

export const BANK_ACCOUNT_QUERY_REPOSITORY = Symbol(
  'IBankAccountQueryRepository'
);

export interface IBankAccountQueryRepository {
  findById(id: string): Promise<BankAccount | null>;
  findByClinic(filter: FindBankAccountsFilter): Promise<Paginated<BankAccount>>;
}
