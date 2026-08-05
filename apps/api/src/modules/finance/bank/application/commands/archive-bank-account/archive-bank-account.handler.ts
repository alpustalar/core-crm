import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ArchiveBankAccountCommand } from './archive-bank-account.command';
import {
  BANK_ACCOUNT_COMMAND_REPOSITORY,
  IBankAccountCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-account.repository';
import { BankAccountNotFoundException } from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ArchiveBankAccountCommand)
export class ArchiveBankAccountHandler implements ICommandHandler<
  ArchiveBankAccountCommand,
  void
> {
  constructor(
    @Inject(BANK_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IBankAccountCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ArchiveBankAccountCommand): Promise<void> {
    const { accountId, ctx } = command;

    const account = await this.accountCommandRepo.findById(accountId);
    if (!account) {
      throw new BankAccountNotFoundException(accountId);
    }

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicFinances(account.clinicId.value))
      .orThrow('bank-account.archive');

    account.archive();

    await this.txManager.run(async () => {
      await this.accountCommandRepo.update(account);
    });
  }
}
