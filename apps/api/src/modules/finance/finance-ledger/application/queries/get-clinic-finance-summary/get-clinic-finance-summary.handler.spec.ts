import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { GetClinicFinanceSummaryHandler } from './get-clinic-finance-summary.handler';
import { GetClinicFinanceSummaryQuery } from './get-clinic-finance-summary.query';

describe('GetClinicFinanceSummaryHandler', () => {
  const summary = {
    totalIncome: '1000.00',
    totalExpenses: '400.00',
    balance: '600.00',
    entryCount: 5,
  };

  const make = () => {
    const repo = { getClinicSummary: jest.fn().mockResolvedValue(summary) };
    const orThrow = jest.fn();
    const check = jest.fn().mockReturnValue({ orThrow });
    const policyFactory = {
      clinic: jest.fn().mockReturnValue({ evaluator: { check } }),
    };
    const handler = new GetClinicFinanceSummaryHandler(
      repo as never,
      policyFactory as never
    );
    return { handler, repo, policyFactory, check };
  };

  const ctx = { actor: { id: 'u1' }, source: 'API' } as never;

  afterEach(() => jest.restoreAllMocks());

  it('aktör yetkili ise şube özetini döner', async () => {
    jest.spyOn(ExecutionPolicy, 'isSystemInitiated').mockReturnValue(false);
    const { handler, repo, check } = make();
    const from = new Date('2026-01-01');
    const to = new Date('2026-12-31');

    const result = await handler.execute(
      new GetClinicFinanceSummaryQuery({
        clinicId: 'clinic-1',
        ctx,
        dateFrom: from,
        dateTo: to,
      })
    );

    expect(check).toHaveBeenCalledTimes(1); // yetki kontrolü yapıldı
    expect(repo.getClinicSummary).toHaveBeenCalledWith('clinic-1', {
      dateFrom: from,
      dateTo: to,
    });
    expect(result).toEqual({ data: summary });
  });

  it('sistem tetikli çağrıda yetki kontrolü atlanır', async () => {
    jest.spyOn(ExecutionPolicy, 'isSystemInitiated').mockReturnValue(true);
    const { handler, check } = make();

    await handler.execute(
      new GetClinicFinanceSummaryQuery({ clinicId: 'clinic-1', ctx })
    );

    expect(check).not.toHaveBeenCalled();
  });
});
