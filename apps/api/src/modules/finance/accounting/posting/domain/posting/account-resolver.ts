import { Account } from '@shared';
import { AccountCodeNotFoundException } from '@modules/finance/accounting/posting/domain/exceptions/posting.exceptions';

/**
 * Hesap kodunu (ör. '120', '600.04') Account entity'sine çözer.
 * Hesap planı tek sorguyla yüklenip bu resolver'a verilir (kod → account).
 */
export class AccountResolver {
  private readonly byCode = new Map<string, Account>();

  constructor(accounts: Account[]) {
    for (const account of accounts) {
      this.byCode.set(account.code, account);
    }
  }

  /**
   * Dışarıdan gelen düz string hesap kodunu hızlıca O(1) maliyetle çözer.
   */
  public resolve(code: string): Account {
    const account = this.byCode.get(code);
    if (!account) {
      throw new AccountCodeNotFoundException(code);
    }
    return account;
  }
}
