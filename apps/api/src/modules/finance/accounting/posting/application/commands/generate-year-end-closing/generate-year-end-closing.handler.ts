import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';
import {
  IJournalCommandRepository,
  IJournalQueryRepository,
  JOURNAL_COMMAND_REPOSITORY,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { AccountResolver } from '@modules/finance/accounting/posting/domain/posting/account-resolver';
import { CreateJournalEntryLineInput } from '@modules/finance/accounting/posting/domain/types/create-journal-entry.props';
import { GenerateYearEndClosingCommand } from './generate-year-end-closing.command';

const RESULT_ACCOUNT_PREFIXES = ['6', '7']; // gelir/gider/maliyet sonuç hesapları
const SUMMARY_ACCOUNT_PREFIX = '69'; // 690/691/692 dönem sonucu özeti — kapatılmaz

interface PostClosingEntryInput {
  clinicId: string;
  organizationId: string;
  periodId: string;
  entryDate: Date;
  description: string;
  performedById?: string | null;
  lines: CreateJournalEntryLineInput[];
}

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

  async execute(command: GenerateYearEndClosingCommand): Promise<void> {
    const { input, ctx } = command;

    const { data: accounts } = await this.queryBus.execute(
      new GetChartOfAccountsQuery(input.clinicId, ctx)
    );
    const resolver = new AccountResolver(accounts);
    const accountById = new Map(accounts.map((a) => [a.id, a]));

    const rows = await this.journalQueryRepo.trialBalance({
      clinicId: input.clinicId,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    });

    // Sonuç hesaplarını (6xx/7xx, 69x hariç) net bakiyeleriyle kapat.
    const closingLines: CreateJournalEntryLineInput[] = [];
    let incomeTotal = new Decimal(0); // alacak bakiyeli (gelir)
    let expenseTotal = new Decimal(0); // borç bakiyeli (gider)

    for (const row of rows) {
      const account = accountById.get(row.accountId);
      if (!account || !this.isResultAccount(account.code.value)) continue;

      const net = new Decimal(row.totalDebit.toString()).minus(
        row.totalCredit.toString()
      );
      if (net.isZero()) continue;

      if (net.isPositive()) {
        // Gider (borç bakiye) → kapatmak için alacaklandır.
        closingLines.push({
          accountId: account.id,
          credit: net,
          lineDesc: `Kapanış: ${account.code.value}`,
        });
        expenseTotal = expenseTotal.plus(net);
      } else {
        // Gelir (alacak bakiye) → kapatmak için borçlandır.
        closingLines.push({
          accountId: account.id,
          debit: net.negated(),
          lineDesc: `Kapanış: ${account.code.value}`,
        });
        incomeTotal = incomeTotal.plus(net.negated());
      }
    }

    if (closingLines.length === 0) return; // sonuç hesabında hareket yok

    const profit = incomeTotal.minus(expenseTotal);
    const account690 = resolver.resolve('690');

    // Fiş A: 6xx/7xx → 690. Kâr/zarar varsa 690 dengeyi kurar.
    const entryALines = [...closingLines];
    if (profit.isPositive()) {
      entryALines.push({
        accountId: account690.id,
        credit: profit,
        lineDesc: 'Dönem kârı',
      });
    } else if (profit.isNegative()) {
      entryALines.push({
        accountId: account690.id,
        debit: profit.negated(),
        lineDesc: 'Dönem zararı',
      });
    }

    const common = {
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      periodId: input.periodId,
      entryDate: input.entryDate,
      performedById: input.performedById,
    };

    await this.txManager.outboxRun(async () => {
      await this.postClosingEntry({
        ...common,
        description: 'Gelir/gider hesaplarının kapanışı (→690)',
        lines: entryALines,
      });

      // Fiş B: 690 → 590 (net kâr) / 591 (net zarar). profit=0 ise devir yok.
      if (profit.isZero()) return;

      const account590 = resolver.resolve('590');
      const account591 = resolver.resolve('591');
      const entryBLines: CreateJournalEntryLineInput[] = profit.isPositive()
        ? [
            { accountId: account690.id, debit: profit, lineDesc: 'Dönem net kârı devri' },
            { accountId: account590.id, credit: profit, lineDesc: 'Dönem Net Kârı' },
          ]
        : [
            {
              accountId: account591.id,
              debit: profit.negated(),
              lineDesc: 'Dönem Net Zararı',
            },
            {
              accountId: account690.id,
              credit: profit.negated(),
              lineDesc: 'Dönem zararı devri',
            },
          ];

      await this.postClosingEntry({
        ...common,
        description: 'Dönem K/Z devri (690 → 590/591)',
        lines: entryBLines,
      });
    });
  }

  private isResultAccount(code: string): boolean {
    return (
      RESULT_ACCOUNT_PREFIXES.some((p) => code.startsWith(p)) &&
      !code.startsWith(SUMMARY_ACCOUNT_PREFIX)
    );
  }

  private async postClosingEntry(input: PostClosingEntryInput): Promise<void> {
    const entry = JournalEntry.createDraft({
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      periodId: input.periodId,
      entryDate: input.entryDate,
      description: input.description,
      eventId: null,
      performedById: input.performedById,
      lines: input.lines,
    });
    const entryNo = await this.journalCommandRepo.nextEntryNo(
      input.clinicId,
      input.periodId
    );
    entry.post(entryNo);
    await this.journalCommandRepo.save(entry);
  }
}
