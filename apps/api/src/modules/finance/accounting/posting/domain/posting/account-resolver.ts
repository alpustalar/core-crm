import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';

/**
 * Hesap kodunu (ör. '120', '600.04') Account entity'sine çözer.
 * Hesap planı tek sorguyla yüklenip bu resolver'a verilir (kod → account).
 */
export class AccountResolver {
  private readonly byCode = new Map<string, Account>();

  constructor(accounts: Account[]) {
    for (const account of accounts) {
      this.byCode.set(account.code.value, account);
    }
  }

  /**
   * Dışarıdan gelen düz string hesap kodunu hızlıca O(1) maliyetle çözer.
   */
  public resolve(code: string): Account {
    const account = this.byCode.get(code);
    if (!account) {
      throw new Error(`Hesap planında kod bulunamadı: ${code}`);
    }
    return account;
  }
}
