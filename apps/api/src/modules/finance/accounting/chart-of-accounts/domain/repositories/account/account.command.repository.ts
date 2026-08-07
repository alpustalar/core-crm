import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';

export const ACCOUNT_COMMAND_REPOSITORY = Symbol('IAccountCommandRepository');

export interface IAccountCommandRepository {
  update(account: Account): Promise<Account>;
  updateMany(accounts: Account[]): Promise<void>;

  /**
   * Tenant açılışında hesap planı ağacını tek seferde kurar.
   * Parent FK'sini koruyabilmek için kayıtlar parent-first sırada eklenir.
   */
  createChart(accounts: Account[]): Promise<void>;

  /**
   * Şubede hesap planı kurulmuş mu — açılış akışının idempotentlik kararı.
   * Yazmayı kapıda durdurduğu için Command Context'e ait.
   */
  existsForClinic(clinicId: string): Promise<boolean>;
}
