import { InitializeTaxParametersHandler } from './initialize-tax-parameters.handler';
import { InitializeTaxParametersCommand } from './initialize-tax-parameters.command';
import { TAX_PARAMETER_DEFAULTS } from '@modules/finance/accounting/tax-parameters/domain/constants/tax-parameter-defaults';

describe('InitializeTaxParametersHandler', () => {
  const ctx = {} as never;

  const make = (exists: boolean) => {
    const commandRepo = { saveMany: jest.fn().mockResolvedValue(undefined) };
    const queryRepo = {
      existsForClinic: jest.fn().mockResolvedValue(exists),
    };
    const txManager = {
      run: jest.fn().mockImplementation((cb: () => Promise<unknown>) => cb()),
    };
    const handler = new InitializeTaxParametersHandler(
      commandRepo as never,
      queryRepo as never,
      txManager as never
    );
    return { handler, commandRepo };
  };

  it('parametre yoksa tüm varsayılanları tek seferde seed eder', async () => {
    const { handler, commandRepo } = make(false);

    await handler.execute(
      new InitializeTaxParametersCommand('clinic-1', 'org-1', ctx)
    );

    expect(commandRepo.saveMany).toHaveBeenCalledTimes(1);
    const seeded = commandRepo.saveMany.mock.calls[0][0];
    expect(seeded).toHaveLength(TAX_PARAMETER_DEFAULTS.length);
    expect(seeded.every((p: { validTo: Date | null }) => p.validTo === null)).toBe(
      true
    );
  });

  it('idempotent: parametre zaten varsa hiçbir şey yapmaz', async () => {
    const { handler, commandRepo } = make(true);

    await handler.execute(
      new InitializeTaxParametersCommand('clinic-1', 'org-1', ctx)
    );

    expect(commandRepo.saveMany).not.toHaveBeenCalled();
  });
});
