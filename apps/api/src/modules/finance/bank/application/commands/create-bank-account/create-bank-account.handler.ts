import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBankAccountCommand } from './create-bank-account.command';
import {
  BANK_ACCOUNT_COMMAND_REPOSITORY,
  IBankAccountCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-account.repository';
import { BankAccount } from '@modules/finance/bank/domain/entities/bank-account.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(CreateBankAccountCommand)
export class CreateBankAccountHandler
  implements ICommandHandler<CreateBankAccountCommand, string>
{
  constructor(
    @Inject(BANK_ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IBankAccountCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateBankAccountCommand): Promise<string> {
    const { data, ctx } = command;
    const { actor } = ctx;

    const clinicId = actor.clinicId ?? '';
    const organizationId =
      actor.organizationId ?? actor.ownedOrganizations?.[0]?.id ?? '';

    this.policyFactory
      .finance(actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicFinances(clinicId))
      .orThrow('bank-account.create');

    const account = BankAccount.create({
      clinicId,
      organizationId,
      name: data.name,
      bankName: data.bankName,
      iban: data.iban,
      accountNo: data.accountNo,
      currency: data.currency,
      openingBalance: data.openingBalance,
    });

    return this.txManager.run(async () => {
      const saved = await this.accountCommandRepo.create(account);
      return saved.id.value;
    });
  }
}
