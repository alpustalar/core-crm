import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import {
  IJournalCommandRepository,
  IJournalQueryRepository,
  JOURNAL_COMMAND_REPOSITORY,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { AccountResolver } from '@modules/finance/accounting/posting/domain/posting/account-resolver';
import { GenerateYearEndClosingCommand } from './generate-year-end-closing.command';
import { YearEndClosingService } from '@modules/finance/accounting/posting/domain/services/year-and-closing.service';
import { isEmpty } from '@common/utils';

@CommandHandler(GenerateYearEndClosingCommand)
export class GenerateYearEndClosingHandler
  implements ICommandHandler<GenerateYearEndClosingCommand, void>
{
  constructor(
    @Inject(JOURNAL_COMMAND_REPOSITORY)
    private readonly journalCommandRepo: IJournalCommandRepository,
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  // TODO: burası tekrar kontrol edilecek. logic hatası ya da başka bi şey olabilir

  async execute(command: GenerateYearEndClosingCommand): Promise<void> {
    const { input, ctx } = command;

    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(input.clinicId, ctx)
    );
    const resolver = new AccountResolver(accounts);

    const rows = await this.journalQueryRepo.trialBalance({
      clinicId: input.clinicId,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    });

    const closingEntries = YearEndClosingService.generateClosingEntries({
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      periodId: input.periodId,
      entryDate: input.entryDate,
      performedById: input.performedById,
      trialBalanceRows: rows,
      resolver,
      accounts,
    });

    if (isEmpty(closingEntries)) return;

    await this.txManager.outboxRun(async () => {
      for (const entry of closingEntries) {
        const entryNo = await this.journalCommandRepo.nextEntryNo(
          input.clinicId,
          input.periodId
        );

        entry.post(entryNo); // Durumu 'POSTED' yapıp fiş numarasını aggregate içine mühürle
        await this.journalCommandRepo.save(entry);
      }
    });
  }
}
