import { Decimal } from 'decimal.js';
import { AutoMatchStatementLinesHandler } from './auto-match-statement-lines.handler';
import { AutoMatchStatementLinesCommand } from './auto-match-statement-lines.command';
import { BankStatementLine } from '@modules/finance/bank/domain/entities/bank-statement-line.entity';
import { BankStatementNotFoundException } from '@modules/finance/bank/domain/exceptions/bank.exceptions';
import { BankLedgerLineView } from '@modules/finance/accounting/posting/application/queries/get-bank-ledger-lines/get-bank-ledger-lines.response';

describe('AutoMatchStatementLinesHandler (banka oto-eşleştirme)', () => {
  const clinicId = '11111111-1111-4111-8111-111111111111';
  const orgId = '22222222-2222-4222-8222-222222222222';
  const statementId = '33333333-3333-4333-8333-333333333333';
  const accountId = '44444444-4444-4444-8444-444444444444';
  const ctx = { actor: { userId: 'user-1' }, source: 'WEB' } as never;

  const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

  function makeLine(id: string, amount: string, date = '2026-06-10') {
    return BankStatementLine.createForImport({
      id,
      bankStatementId: statementId,
      bankAccountId: accountId,
      clinicId,
      organizationId: orgId,
      transactionDate: day(date),
      description: 'GELEN HAVALE',
      amount: Number(amount),
    });
  }

  function ledgerRow(
    lineId: string,
    debit: string,
    date = '2026-06-10',
    description: string | null = 'Tahsilat'
  ): BankLedgerLineView {
    return {
      lineId,
      entryId: `entry-${lineId}`,
      entryNo: '5',
      entryDate: day(date),
      entryDescription: description,
      lineDesc: null,
      debit,
      credit: '0',
    };
  }

  function build(options: {
    lines: BankStatementLine[];
    ledgerRows: BankLedgerLineView[];
    usedRefs?: string[];
    statementExists?: boolean;
  }) {
    const updateMany = jest.fn().mockResolvedValue(undefined);
    const lineCommandRepo = {
      findUnmatchedByStatementId: jest.fn().mockResolvedValue(options.lines),
      findUsedMatchRefs: jest.fn().mockResolvedValue(options.usedRefs ?? []),
      updateMany,
    } as never;

    const statementCommandRepo = {
      findById: jest.fn().mockResolvedValue(
        options.statementExists === false
          ? null
          : {
              clinicId: { value: clinicId },
              periodStart: day('2026-06-01'),
              periodEnd: day('2026-06-30'),
            }
      ),
    } as never;

    const policyFactory = {
      finance: () => ({
        evaluator: { check: () => ({ orThrow: jest.fn() }) },
      }),
    } as never;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: options.ledgerRows }),
    } as never;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as never;

    return {
      handler: new AutoMatchStatementLinesHandler(
        lineCommandRepo,
        statementCommandRepo,
        policyFactory,
        queryBus,
        txManager
      ),
      updateMany,
      lineCommandRepo,
    };
  }

  const run = (handler: AutoMatchStatementLinesHandler) =>
    handler.execute(
      new AutoMatchStatementLinesCommand({
        bankStatementId: statementId,
        data: {},
        ctx,
      })
    );

  it('tek aday varsa satırı MATCHED + AUTO işaretler ve kaynağını yazar', async () => {
    const line = makeLine('55555555-5555-4555-8555-555555555555', '1500');
    const { handler, updateMany } = build({
      lines: [line],
      ledgerRows: [ledgerRow('jl-1', '1500.00')],
    });

    const result = await run(handler);

    expect(result.matchedCount).toBe(1);
    expect(result.unmatchedCount).toBe(0);
    expect(line.matchStatus).toBe('MATCHED');
    expect(line.matchSource).toBe('AUTO');
    expect(line.matchedRef).toBe('jl-1');
    expect(line.matchNote).toContain('Oto-eşleştirme');
    expect(updateMany).toHaveBeenCalledWith([line]);
  });

  it('iki eşit aday varsa dokunmaz — belirsiz sayılır', async () => {
    const line = makeLine('55555555-5555-4555-8555-555555555555', '1500');
    const { handler, updateMany } = build({
      lines: [line],
      ledgerRows: [ledgerRow('jl-1', '1500.00'), ledgerRow('jl-2', '1500.00')],
    });

    const result = await run(handler);

    expect(result.ambiguousCount).toBe(1);
    expect(result.matchedCount).toBe(0);
    expect(line.matchStatus).toBe('UNMATCHED');
    expect(updateMany).toHaveBeenCalledWith([]);
  });

  it('aday başka bir ekstre satırına zaten bağlıysa kullanılmaz (çift sayım yok)', async () => {
    const line = makeLine('55555555-5555-4555-8555-555555555555', '1500');
    const { handler } = build({
      lines: [line],
      ledgerRows: [ledgerRow('jl-1', '1500.00')],
      usedRefs: ['jl-1'],
    });

    const result = await run(handler);

    expect(result.matchedCount).toBe(0);
    expect(result.unmatchedCount).toBe(1);
    expect(line.matchStatus).toBe('UNMATCHED');
  });

  it('aynı tur içinde bir defter satırı iki ekstre satırına verilmez', async () => {
    // İki ekstre satırı aynı tutar/tarihte; defterde tek aday var.
    const first = makeLine('55555555-5555-4555-8555-555555555555', '1500');
    const second = makeLine('66666666-6666-4666-8666-666666666666', '1500');
    const { handler, updateMany } = build({
      lines: [first, second],
      ledgerRows: [ledgerRow('jl-1', '1500.00')],
    });

    const result = await run(handler);

    expect(result.matchedCount).toBe(1);
    expect(first.matchStatus).toBe('MATCHED');
    expect(second.matchStatus).toBe('UNMATCHED');
    expect(updateMany).toHaveBeenCalledWith([first]);
  });

  it('aday yoksa satır açık kalır', async () => {
    const line = makeLine('55555555-5555-4555-8555-555555555555', '1500');
    const { handler } = build({
      lines: [line],
      ledgerRows: [ledgerRow('jl-1', '999.00')],
    });

    const result = await run(handler);

    expect(result).toMatchObject({
      scannedCount: 1,
      matchedCount: 0,
      ambiguousCount: 0,
      unmatchedCount: 1,
    });
  });

  it('ekstre yoksa BankStatementNotFoundException fırlatır', async () => {
    const { handler } = build({
      lines: [],
      ledgerRows: [],
      statementExists: false,
    });

    await expect(run(handler)).rejects.toBeInstanceOf(
      BankStatementNotFoundException
    );
  });

  it('aday taraması ekstre dönemini tolerans kadar genişletir', async () => {
    const { handler } = build({ lines: [], ledgerRows: [] });
    await run(handler);

    // periodStart 2026-06-01 − 3 gün, periodEnd 2026-06-30 + 3 gün
    const dispatched = (
      handler as unknown as { queryBus: { execute: jest.Mock } }
    ).queryBus.execute.mock.calls[0][0];
    expect(dispatched.payload.dateFrom).toEqual(day('2026-05-29'));
    expect(dispatched.payload.dateTo).toEqual(day('2026-07-03'));
  });

  it('Decimal tutarlar string olarak gelse de kuruş hassasiyeti korunur', async () => {
    const line = makeLine('55555555-5555-4555-8555-555555555555', '1234.56');
    const { handler } = build({
      lines: [line],
      ledgerRows: [ledgerRow('jl-1', '1234.56')],
    });

    const result = await run(handler);
    expect(result.matchedCount).toBe(1);
    expect(new Decimal(line.amount.toString()).toFixed(2)).toBe('1234.56');
  });
});
