import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  ACCOUNT_COMMAND_REPOSITORY,
  ACCOUNT_QUERY_REPOSITORY,
  IAccountCommandRepository,
  IAccountQueryRepository,
} from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account.repository';
import { Account } from '@modules/finance/accounting/chart-of-accounts/domain/entities/account.entity';
import { InitializeChartOfAccountsCommand } from './initialize-chart-of-accounts.command';

/**
 * Bir clinic (şube/defter) için klinik TDHP hesap planını kurar.
 * İdempotenttir: hesap planı zaten varsa hiçbir şey yapmaz (mükerrer kurulumu önler).
 */
@CommandHandler(InitializeChartOfAccountsCommand)
export class InitializeChartOfAccountsHandler
  implements ICommandHandler<InitializeChartOfAccountsCommand, void>
{
  constructor(
    @Inject(ACCOUNT_COMMAND_REPOSITORY)
    private readonly accountCommandRepo: IAccountCommandRepository,
    @Inject(ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IAccountQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: InitializeChartOfAccountsCommand): Promise<void> {
    const { clinicId, organizationId } = command;

    const alreadyInitialized =
      await this.accountQueryRepo.existsForClinic(clinicId);
    if (alreadyInitialized) return;

    const accounts = Account.buildChartFromTemplate({
      clinicId,
      organizationId,
    });

    await this.txManager.run(async () => {
      await this.accountCommandRepo.createChart(accounts);
    });
  }
}
