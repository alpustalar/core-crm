import { Decimal } from 'decimal.js';
import { GetVatDeclarationHandler } from './get-vat-declaration.handler';
import { GetVatDeclarationQuery } from './get-vat-declaration.query';
import {
  IJournalQueryRepository,
  VatDeclaration,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

describe('GetVatDeclarationHandler (doc 06 §1)', () => {
  const ctx = { actor: { clinicId: 'clinic-1' } } as never;

  // 391 Hesaplanan, 191 İndirilecek + alt hesabı 191.01; 600 alakasız (hariç tutulmalı).
  const chart = [
    { id: 'acc-391', code: '391', isPostable: true },
    { id: 'acc-191', code: '191', isPostable: true },
    { id: 'acc-191-01', code: '191.01', isPostable: true },
    { id: 'acc-600', code: '600.01', isPostable: true },
  ];

  const mov = (entryDate: string, debit: number, credit: number) => ({
    entryDate: new Date(entryDate),
    debit: new Decimal(debit) as never,
    credit: new Decimal(credit) as never,
  });

  const build = (declaration: VatDeclaration) => {
    const journalQueryRepo = {
      vatDeclaration: jest.fn().mockResolvedValue(declaration),
    } as unknown as IJournalQueryRepository;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: chart }),
    } as unknown as TSQueryBus;

    return {
      handler: new GetVatDeclarationHandler(journalQueryRepo, queryBus),
      journalQueryRepo,
    };
  };

  const run = (handler: GetVatDeclarationHandler) =>
    handler.execute(
      new GetVatDeclarationQuery({
        clinicId: 'clinic-1',
        ctx,
        dateFrom: new Date('2026-01-01'),
        dateTo: new Date('2026-02-28'),
      })
    );

  it('391 > 191 → ödenecek KDV (devreden 0), aylık kırılım kronolojik', async () => {
    // Ocak: hesaplanan 1000, indirilecek 300 → net 700. Şubat: hesaplanan 500, indirilecek 100 → net 400.
    const { handler } = build({
      output: [mov('2026-01-15', 0, 1000), mov('2026-02-10', 0, 500)],
      input: [mov('2026-01-20', 300, 0), mov('2026-02-12', 100, 0)],
    });

    const { data } = await run(handler);

    expect(data.outputVat).toBe('1500.00');
    expect(data.inputVat).toBe('400.00');
    expect(data.netVat).toBe('1100.00');
    expect(data.payableVat).toBe('1100.00');
    expect(data.carryForwardVat).toBe('0.00');
    expect(data.months).toEqual([
      { month: '2026-01', outputVat: '1000.00', inputVat: '300.00', net: '700.00' },
      { month: '2026-02', outputVat: '500.00', inputVat: '100.00', net: '400.00' },
    ]);
  });

  it('191 > 391 → devreden KDV (ödenecek 0)', async () => {
    const { handler } = build({
      output: [mov('2026-01-15', 0, 300)],
      input: [mov('2026-01-20', 1000, 0)],
    });

    const { data } = await run(handler);

    expect(data.outputVat).toBe('300.00');
    expect(data.inputVat).toBe('1000.00');
    expect(data.netVat).toBe('-700.00');
    expect(data.payableVat).toBe('0.00');
    expect(data.carryForwardVat).toBe('700.00');
  });

  it('yalnız 391/191 hesapları (alt hesaplar dahil) repoya geçer, 600 hariç', async () => {
    const { handler, journalQueryRepo } = build({ output: [], input: [] });

    await run(handler);

    expect(journalQueryRepo.vatDeclaration).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        outputAccountIds: ['acc-391'],
        inputAccountIds: ['acc-191', 'acc-191-01'],
      })
    );
  });
});
