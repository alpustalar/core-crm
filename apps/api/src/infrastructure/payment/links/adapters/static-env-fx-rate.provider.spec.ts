import { ConfigService } from '@nestjs/config';
import { StaticEnvFxRateProvider } from './static-env-fx-rate.provider';

describe('StaticEnvFxRateProvider', () => {
  const build = (env: Record<string, string>) => {
    const config = {
      get: jest.fn((key: string) => env[key]),
    } as unknown as ConfigService;
    return new StaticEnvFxRateProvider(config);
  };

  it('aynı para birimi → 1', async () => {
    const fx = build({});
    expect(await fx.getRate('TRY', 'TRY')).toBe(1);
    expect(await fx.getRate('EUR', 'EUR')).toBe(1);
  });

  it('EUR→TRY env oranını okur', async () => {
    const fx = build({ FX_EUR_TRY: '43.5' });
    expect(await fx.getRate('EUR', 'TRY')).toBe(43.5);
  });

  it('USD→TRY env oranını okur', async () => {
    const fx = build({ FX_USD_TRY: '41' });
    expect(await fx.getRate('USD', 'TRY')).toBe(41);
  });

  it('oran tanımlı değilse hata fırlatır (iyzico linki atlanır)', async () => {
    const fx = build({});
    await expect(fx.getRate('EUR', 'TRY')).rejects.toThrow();
  });

  it('TRY dışı hedef desteklenmez', async () => {
    const fx = build({ FX_EUR_TRY: '43.5' });
    await expect(fx.getRate('EUR', 'USD')).rejects.toThrow();
  });
});
