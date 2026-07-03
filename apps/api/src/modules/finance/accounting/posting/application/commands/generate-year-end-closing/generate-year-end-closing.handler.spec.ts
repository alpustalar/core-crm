import { Decimal } from 'decimal.js';
import { GenerateYearEndClosingHandler } from './generate-year-end-closing.handler';
import { GenerateYearEndClosingCommand } from './generate-year-end-closing.command';
import {
  IJournalCommandRepository,
  IJournalQueryRepository,
  TrialBalanceRow,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalEntry } from '@modules/finance/accounting/posting/domain/entities/journal-entry.entity';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

describe('GenerateYearEndClosingHandler (yıl sonu kapanış, doc 04)', () => {
  const ctx = { actor: { userId: 'u-1' } } as never;

  // 600 gelir, 770 gider, 690/590/591 özet; 690 trial balance'ta olsa bile kapatılmaz.
  const chart = [
    { id: 'acc-600', code: '600', isPostable: true },
    { id: 'acc-770', code: '770', isPostable: true },
    { id: 'acc-690', code: '690', isPostable: true },
    { id: 'acc-590', code: '590', isPostable: true },
    { id: 'acc-591', code: '591', isPostable: true },
  ];

  const row = (
    accountId: string,
    debit: number,
    credit: number
  ): TrialBalanceRow => ({
    accountId,
    totalDebit: new Decimal(debit) as never,
    totalCredit: new Decimal(credit) as never,
  });

  const build = (rows: TrialBalanceRow[]) => {
    let seq = 100n;
    const saved: JournalEntry[] = [];
    const journalCommandRepo = {
      nextEntryNo: jest.fn().mockImplementation(() => Promise.resolve(seq++)),
      save: jest.fn(async (e: JournalEntry) => {
        saved.push(e);
        return e;
      }),
      applyReversal: jest.fn(),
    } as unknown as IJournalCommandRepository;

    const journalQueryRepo = {
      trialBalance: jest.fn().mockResolvedValue(rows),
    } as unknown as IJournalQueryRepository;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: chart }),
    } as unknown as TSQueryBus;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as never;

    return {
      handler: new GenerateYearEndClosingHandler(
        journalCommandRepo,
        journalQueryRepo,
        queryBus,
        txManager
      ),
      journalCommandRepo,
      saved,
    };
  };

  const run = (handler: GenerateYearEndClosingHandler) =>
    handler.execute(
      new GenerateYearEndClosingCommand(
        {
          clinicId: 'clinic-1',
          organizationId: 'org-1',
          periodId: 'period-1',
          dateFrom: new Date('2026-01-01'),
          dateTo: new Date('2026-12-31'),
          entryDate: new Date('2026-12-31'),
        },
        ctx
      )
    );

  const lineOf = (entry: JournalEntry, accountId: string) =>
    entry.lines.items.find((l) => l.accountId === accountId);

  it('kâr: 6xx/7xx→690 (Fiş A) + 690→590 (Fiş B), 69x hariç', async () => {
    // gelir 600 alacak 1000, gider 770 borç 300 → kâr 700. 690'ın eski bakiyesi yok sayılır.
    const { handler, saved } = build([
      row('acc-600', 0, 1000),
      row('acc-770', 300, 0),
      row('acc-690', 9999, 0), // özet hesap — kapatılmamalı
    ]);

    await run(handler);

    expect(saved).toHaveLength(2);
    const [a, b] = saved;
    // Fiş A
    expect(lineOf(a, 'acc-600')!.debit.toString()).toBe('1000');
    expect(lineOf(a, 'acc-770')!.credit.toString()).toBe('300');
    expect(lineOf(a, 'acc-690')!.credit.toString()).toBe('700');
    expect(a.isBalanced).toBe(true);
    // 690 trial-balance satırı sonuç hesabı sayılmadı (yalnız denge satırı var)
    expect(a.lines.items).toHaveLength(3);
    // Fiş B: 690 → 590
    expect(lineOf(b, 'acc-690')!.debit.toString()).toBe('700');
    expect(lineOf(b, 'acc-590')!.credit.toString()).toBe('700');
    expect(b.isBalanced).toBe(true);
  });

  it('zarar: 690 borç + 591 devri', async () => {
    // gelir 600 alacak 200, gider 770 borç 500 → zarar 300.
    const { handler, saved } = build([row('acc-600', 0, 200), row('acc-770', 500, 0)]);

    await run(handler);

    expect(saved).toHaveLength(2);
    const [a, b] = saved;
    expect(lineOf(a, 'acc-690')!.debit.toString()).toBe('300');
    expect(a.isBalanced).toBe(true);
    expect(lineOf(b, 'acc-591')!.debit.toString()).toBe('300');
    expect(lineOf(b, 'acc-690')!.credit.toString()).toBe('300');
  });

  it('sonuç hesabında hareket yoksa fiş üretmez', async () => {
    const { handler, journalCommandRepo, saved } = build([
      row('acc-690', 5000, 0), // yalnız özet hesap → kapatılacak sonuç hesabı yok
    ]);

    await run(handler);

    expect(saved).toHaveLength(0);
    expect(journalCommandRepo.save).not.toHaveBeenCalled();
  });
});
