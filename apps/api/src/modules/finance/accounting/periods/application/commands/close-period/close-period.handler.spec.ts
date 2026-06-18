import { ConflictException } from '@nestjs/common';
import { ClosePeriodHandler } from './close-period.handler';
import { ClosePeriodCommand } from './close-period.command';
import { GenerateYearEndClosingCommand } from '@modules/finance/accounting/posting/application/commands/generate-year-end-closing/generate-year-end-closing.command';
import {
  IAccountingPeriodCommandRepository,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

describe('ClosePeriodHandler (dönem kapanışı, doc 04/08)', () => {
  const ctx = { actor: { userId: 'u-1' } } as never;

  const makePeriod = (isClosed = false) => ({
    id: 'period-1',
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    year: 2026,
    startsAt: new Date('2026-01-01'),
    endsAt: new Date('2026-12-31'),
    isClosed: jest.fn().mockReturnValue(isClosed),
    close: jest.fn(),
  });

  const build = (period: ReturnType<typeof makePeriod> | null) => {
    const periodQueryRepo = {
      findById: jest.fn().mockResolvedValue(period),
    } as unknown as IAccountingPeriodQueryRepository;
    const periodCommandRepo = {
      save: jest.fn().mockResolvedValue(period),
    } as unknown as IAccountingPeriodCommandRepository;
    const commandBus = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as TSCommandBus;
    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as never;

    return {
      handler: new ClosePeriodHandler(
        periodCommandRepo,
        periodQueryRepo,
        commandBus,
        txManager
      ),
      periodCommandRepo,
      commandBus,
    };
  };

  const run = (handler: ClosePeriodHandler) =>
    handler.execute(new ClosePeriodCommand('period-1', ctx));

  it('kapanış fişini üretir (posting), dönemi CLOSED yapar ve kaydeder', async () => {
    const period = makePeriod();
    const { handler, periodCommandRepo, commandBus } = build(period);

    await run(handler);

    const closingCall = (commandBus.execute as jest.Mock).mock.calls.find(
      ([c]) => c instanceof GenerateYearEndClosingCommand
    );
    expect(closingCall).toBeDefined();
    const closingCmd = closingCall![0] as GenerateYearEndClosingCommand;
    expect(closingCmd.input).toMatchObject({
      clinicId: 'clinic-1',
      periodId: 'period-1',
      dateFrom: period.startsAt,
      dateTo: period.endsAt,
    });
    expect(period.close).toHaveBeenCalled();
    expect(periodCommandRepo.save).toHaveBeenCalledWith(period);
  });

  it('zaten kapatılmış dönem ConflictException atar, fiş üretmez', async () => {
    const period = makePeriod(true);
    const { handler, commandBus } = build(period);

    await expect(run(handler)).rejects.toBeInstanceOf(ConflictException);
    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(period.close).not.toHaveBeenCalled();
  });
});
