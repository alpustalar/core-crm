import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import {
  FindPeriodByDateQuery
} from '@modules/finance/accounting/periods/application/queries/find-period-by-date/find-period-by-date.query';
import {
  IJournalCommandRepository,
  IJournalQueryRepository,
  JOURNAL_COMMAND_REPOSITORY,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { ReverseJournalEntryCommand } from './reverse-journal-entry.command';
import { AccountingPeriodStatusSchema } from '@shared';

@CommandHandler(ReverseJournalEntryCommand)
export class ReverseJournalEntryHandler
  implements ICommandHandler<ReverseJournalEntryCommand, string>
{
  constructor(
    @Inject(JOURNAL_COMMAND_REPOSITORY)
    private readonly journalCommandRepo: IJournalCommandRepository,
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository,
    private readonly queryBus: TSQueryBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReverseJournalEntryCommand): Promise<string> {
    const { entryId, ctx, reason } = command;

    const original = await this.journalQueryRepo.findById(entryId);
    if (!original) {
      throw new NotFoundException(`Yevmiye fişi bulunamadı: ${entryId}`);
    }

    // Storno bugünün açık dönemine girer; kilitli dönemdeki orijinal kayda dokunulmaz.
    const entryDate = new Date();
    const { data: period } = await this.queryBus.execute(
      new FindPeriodByDateQuery(original.clinicId, entryDate, ctx)
    );
    if (!period) {
      throw new BadRequestException(
        `${entryDate.toISOString()} tarihi için muhasebe dönemi yok.`
      );
    }
    if (period.status !== AccountingPeriodStatusSchema.enum.OPEN) {
      throw new BadRequestException(
        `Dönem ${period.year} kapalı/kilitli; storno atılamaz.`
      );
    }

    const reversalId = crypto.randomUUID();
    // buildReversalDraft + markReversed aynı invariant'ı (POSTED + henüz storno yok) korur.
    const reversal = original.buildReversalDraft({
      reversalId,
      periodId: period.id,
      entryDate,
      description: reason,
      performedById: ctx.actor.userId,
    });
    original.markReversed(reversalId);

    // Storno fişi + orijinalin REVERSED linkajı atomik (kritik finansal mutasyon).
    return this.txManager.outboxRun(async () => {
      const entryNo = await this.journalCommandRepo.nextEntryNo(
        original.clinicId,
        period.id
      );
      reversal.post(entryNo);
      const saved = await this.journalCommandRepo.save(reversal);
      await this.journalCommandRepo.applyReversal(original);
      return saved.id;
    });
  }
}
