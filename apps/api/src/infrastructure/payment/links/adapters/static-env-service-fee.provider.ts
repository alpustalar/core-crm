import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import { IServiceFeeProvider } from '../service-fee.port';

/**
 * v1 statik komisyon sağlayıcı — env'den `HEALTH_TOURISM_SERVICE_FEE_PERCENT` oranını okur.
 * Komisyon platform geliridir; oran tek platform-global ayardır (klinik başına ayarlanamaz).
 * Geçersiz/tanımsız değer 0'a düşürülür (satış = net; komisyon uygulanmaz).
 */
@Injectable()
export class StaticEnvServiceFeeProvider implements IServiceFeeProvider {
  private readonly logger = new Logger(StaticEnvServiceFeeProvider.name);

  constructor(private readonly config: ConfigService) {}

  getServiceFeePercent(): number {
    const raw = this.config.get<string | number>(
      ENV.HEALTH_TOURISM_SERVICE_FEE_PERCENT
    );
    const percent = raw === undefined || raw === null ? NaN : Number(raw);

    if (!Number.isFinite(percent) || percent < 0) {
      this.logger.warn(
        `${ENV.HEALTH_TOURISM_SERVICE_FEE_PERCENT} geçerli değil (${raw}) — komisyon 0 kabul edildi.`
      );
      return 0;
    }

    return percent;
  }
}
