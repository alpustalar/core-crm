import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';
import { IFxRateProvider } from '../fx-rate.port';

/**
 * v1 statik kur sağlayıcı — env'den `FX_<CUR>_TRY` oranlarını okur. Yalnız TRY hedefini
 * destekler (iyzico için). Oran tanımlı değilse açık hata fırlatır; çağıran (initiate handler)
 * iyzico linkini atlar ve Stripe linkiyle devam eder. Canlı kur feed'i (TCMB/exchangerate)
 * sonraki iterasyonda bu portu implemente eden ayrı bir adapter olarak eklenebilir.
 */
@Injectable()
export class StaticEnvFxRateProvider implements IFxRateProvider {
  private readonly logger = new Logger(StaticEnvFxRateProvider.name);

  constructor(private readonly config: ConfigService) {}

  // asOf yok sayılır: statik env oranı tarih-bağımsızdır (canlı/tarihli kur için TCMB adapter).
  async getRate(
    from: CurrencyType,
    to: CurrencyType,
    _asOf?: Date
  ): Promise<number> {
    if (from === to) return 1;

    if (to !== 'TRY') {
      throw new Error(
        `Kur dönüşümü yalnız TRY hedefi için destekleniyor (istenen: ${from}→${to}).`
      );
    }

    if (from === 'TRY') return 1;

    const envKey = this.envKeyFor(from);
    const raw = this.config.get<string>(envKey);
    const rate = raw ? Number(raw) : NaN;

    if (!raw || !Number.isFinite(rate) || rate <= 0) {
      this.logger.warn(
        `${envKey} tanımlı/geçerli değil — ${from}→TRY kuru çözülemedi.`
      );
      throw new Error(`${from}→TRY kuru yapılandırılmamış (${envKey}).`);
    }

    return rate;
  }

  private envKeyFor(from: CurrencyType): string {
    switch (from) {
      case 'EUR':
        return ENV.FX_EUR_TRY;
      case 'USD':
        return ENV.FX_USD_TRY;
      case 'GBP':
        return ENV.FX_GBP_TRY;
      default:
        throw new Error(`Desteklenmeyen kaynak para birimi: ${from}`);
    }
  }
}
