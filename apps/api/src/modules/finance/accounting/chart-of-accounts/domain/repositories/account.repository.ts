import { Account } from '../entities/account.entity';

export const ACCOUNT_COMMAND_REPOSITORY = Symbol('IAccountCommandRepository');
export const ACCOUNT_QUERY_REPOSITORY = Symbol('IAccountQueryRepository');

export interface IAccountCommandRepository {
  save(account: Account): Promise<Account>;
  saveMany(accounts: Account[]): Promise<void>;

  /**
   * Tenant açılışında hesap planı ağacını tek seferde kurar.
   * Parent FK'sini koruyabilmek için kayıtlar parent-first sırada eklenir.
   */
  createChart(accounts: Account[]): Promise<void>;
}

export interface IAccountQueryRepository {
  findById(id: string): Promise<Account | null>;
  findByCode(organizationId: string, code: string): Promise<Account | null>;

  /** Hesap planının tamamı (sınırlı referans set; sayfalanmaz). */
  findAllByOrganizationId(organizationId: string): Promise<Account[]>;

  existsForOrganization(organizationId: string): Promise<boolean>;
}
