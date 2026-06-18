import { BadRequestException } from '@nestjs/common';
import { SetTaxParameterHandler } from './set-tax-parameter.handler';
import { SetTaxParameterCommand } from './set-tax-parameter.command';
import { TaxParameterKeySchema } from '@shared';

describe('SetTaxParameterHandler', () => {
  const ctx = {} as never;
  const input = (validFrom?: Date) => ({
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    key: TaxParameterKeySchema.enum.VAT_HEALTH,
    rate: 8,
    validFrom,
  });

  const make = (open: { validFrom: Date; close: jest.Mock } | null) => {
    const commandRepo = {
      save: jest.fn().mockImplementation((e: unknown) => Promise.resolve(e)),
    };
    const queryRepo = { findOpen: jest.fn().mockResolvedValue(open) };
    const txManager = {
      run: jest.fn().mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new SetTaxParameterHandler(
      commandRepo as never,
      queryRepo as never,
      txManager as never
    );
    return { handler, commandRepo };
  };

  it('açık sürüm yoksa yeni parametre oluşturur ve id döner', async () => {
    const { handler, commandRepo } = make(null);

    const id = await handler.execute(
      new SetTaxParameterCommand(input(new Date('2026-06-01')), ctx)
    );

    expect(commandRepo.save).toHaveBeenCalledTimes(1);
    expect(typeof id).toBe('string');
  });

  it('açık sürüm varsa onu kapatır ve yeni sürüm açar (2 kayıt)', async () => {
    const open = { validFrom: new Date('2026-01-01'), close: jest.fn() };
    const { handler, commandRepo } = make(open);

    await handler.execute(
      new SetTaxParameterCommand(input(new Date('2026-06-01')), ctx)
    );

    expect(open.close).toHaveBeenCalledWith(new Date('2026-06-01'));
    expect(commandRepo.save).toHaveBeenCalledTimes(2); // close + create
  });

  it('validFrom mevcut açık sürümden önce/eşitse reddeder', async () => {
    const open = { validFrom: new Date('2026-06-01'), close: jest.fn() };
    const { handler } = make(open);

    await expect(
      handler.execute(
        new SetTaxParameterCommand(input(new Date('2026-06-01')), ctx)
      )
    ).rejects.toThrow(BadRequestException);
  });
});
