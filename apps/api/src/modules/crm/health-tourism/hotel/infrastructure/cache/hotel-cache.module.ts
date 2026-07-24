import { Module } from '@nestjs/common';
import { HotelCacheService } from './hotel-cache.service';

/**
 * Otel modülünün Redis cache servisini (rate-option token'ları) sağlar. Cache'e
 * erişen command/query handler'ları bu modülü import eder — cross-module kuralı
 * gereği dış modüller (AI executor) cache'e doğrudan değil, bus üzerinden gider.
 */
@Module({
  providers: [HotelCacheService],
  exports: [HotelCacheService],
})
export class HotelCacheModule {}
