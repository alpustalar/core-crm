import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BankAccountStatusSchema } from '@input-type-schemas/BankAccountStatusSchema';
import { ImportBankStatementCommand } from './import-bank-statement.command';
import {
  BANK_ACCOUNT_QUERY_REPOSITORY,
  IBankAccountQueryRepository,
} from '@modules/finance/bank/domain/repositories/bank-account.repository';
import {
  BANK_STATEMENT_COMMAND_REPOSITORY,
  IBankStatementCommandRepository,
} from '@modules/finance/bank/domain/repositories/bank-statement.repository';
import { BankStatement } from '@modules/finance/bank/domain/entities/bank-statement.entity';
import {
  BankAccountArchivedException,
  BankAccountNotFoundException,
} from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(ImportBankStatementCommand)
export class ImportBankStatementHandler
  implements ICommandHandler<ImportBankStatementCommand, string>
{
  constructor(
    @Inject(BANK_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IBankAccountQueryRepository,
    @Inject(BANK_STATEMENT_COMMAND_REPOSITORY)
    private readonly statementCommandRepo: IBankStatementCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ImportBankStatementCommand): Promise<string> {
    const { data, ctx } = command;

    const account = await this.accountQueryRepo.findById(data.bankAccountId);
    if (!account) {
      throw new BankAccountNotFoundException(data.bankAccountId);
    }

    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicFinances(account.clinicId))
      .orThrow('bank-statement.import');

    if (account.status === BankAccountStatusSchema.enum.ARCHIVED) {
      throw new BankAccountArchivedException(account.id);
    }

    const statement = BankStatement.create({
      bankAccountId: account.id,
      clinicId: account.clinicId,
      organizationId: account.organizationId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      openingBalance: data.openingBalance,
      closingBalance: data.closingBalance,
      fileName: data.fileName,
      importedById: ctx.actor.userId,
      lines: data.lines,
    });

    return this.txManager.run(async () => {
      const saved = await this.statementCommandRepo.create(statement);
      return saved.id.value;
    });
  }
}
