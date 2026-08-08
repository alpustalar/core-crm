import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { HealthController } from './health.controller';
import {
  HEALTH_INDICATORS,
  HealthIndicator,
} from './health-indicator.interface';

export interface KernelHealthOptions {
  /**
   * Servisin hazır sayılması için gereken bağımlılıklar. Sırasıyla sağlayıcı
   * olarak kaydedilir ve `HEALTH_INDICATORS` dizisine toplanır.
   */
  indicators: Type<HealthIndicator>[];
  /** Indicator'ların bağımlılıklarını sağlayan modüller. */
  imports?: ModuleMetadata['imports'];
}

/**
 * `/health` (liveness) ve `/health/ready` (readiness) uçlarını açar.
 *
 * Dinamik modül olmasının sebebi indicator'ların servise özgü olması: messaging
 * Mongo + Redis, api Prisma + Redis kontrol eder. Statik olsaydı çekirdek her
 * iki servisin altyapısını da tanımak zorunda kalırdı — Prisma'dan bilinçle
 * koparılmış bir pakette bu mümkün değil.
 */
@Module({})
export class KernelHealthModule {
  static forRoot(options: KernelHealthOptions): DynamicModule {
    return {
      module: KernelHealthModule,
      imports: options.imports ?? [],
      controllers: [HealthController],
      providers: [
        ...options.indicators,
        {
          provide: HEALTH_INDICATORS,
          useFactory: (...instances: HealthIndicator[]) => instances,
          inject: options.indicators,
        },
      ],
    };
  }
}
