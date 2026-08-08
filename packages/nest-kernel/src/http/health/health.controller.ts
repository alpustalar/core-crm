import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  HEALTH_INDICATORS,
  HealthIndicator,
  HealthReport,
} from './health-indicator.interface';

/**
 * Orkestratör probe'ları. **Sürümsüz** (`VERSION_NEUTRAL`) — adres `/health`
 * olarak sabit kalır; probe adresinin API sürümüyle birlikte değişmesi
 * dağıtımı sessizce bozardı.
 *
 * Kimlik doğrulaması yoktur ve olmamalıdır: probe'u atan orkestratörün token'ı
 * yoktur. Bu yüzden gövde yalnız bağımlılık adı + up/down taşır — sürüm,
 * bağlantı adresi, hata metni gibi dışarı sızmaması gereken hiçbir şey yok.
 */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    @Inject(HEALTH_INDICATORS)
    private readonly indicators: HealthIndicator[]
  ) {}

  /**
   * Liveness: süreç ayakta ve istek karşılıyor mu. Bilerek bağımlılığa
   * bakmaz — veritabanı düştüğünde konteyner yeniden başlatılmamalı
   * (yeniden başlatmak veritabanını geri getirmez, yalnız kapasiteyi düşürür).
   */
  @Get()
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /**
   * Readiness: servis trafik alabilir mi. Bağımlılıklardan biri düşükse 503
   * döner ve orkestratör örneği yük dengeleyiciden çeker (süreci öldürmez).
   */
  @Get('ready')
  async ready(): Promise<HealthReport> {
    const results = await Promise.all(
      this.indicators.map(async (indicator) => ({
        name: indicator.name,
        // Kontrolün kendisi patlarsa bu "down" demektir — probe 500 vermemeli.
        healthy: await indicator.isHealthy().catch(() => false),
      }))
    );

    const checks = Object.fromEntries(
      results.map((r) => [r.name, r.healthy ? 'up' : 'down'])
    ) as HealthReport['checks'];

    const report: HealthReport = {
      status: results.every((r) => r.healthy) ? 'ok' : 'error',
      checks,
    };

    if (report.status === 'error') {
      throw new ServiceUnavailableException(report);
    }

    return report;
  }
}
