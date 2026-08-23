import { Module } from '@nestjs/common';
import { HotelCacheService } from './hotel-cache.service';
import { HOTEL_CACHE_SERVICE } from '@modules/crm/health-tourism/hotel/domain/interfaces/hotel-cache.service.interface';

/**
 * Otel modülünün Redis cache servisini (rate-option token'ları) sağlar. Cache'e
 * erişen command/query handler'ları bu modülü import eder — cross-module kuralı
 * gereği dış modüller (AI executor) cache'e doğrudan değil, bus üzerinden gider.
 *
 * Sağlama token üzerinden: tüketiciler sınıfa değil `IHotelCacheService`
 * soyutlamasına bağlanır (repository token deseninin aynısı).
 */
@Module({
  providers: [{ provide: HOTEL_CACHE_SERVICE, useClass: HotelCacheService }],
  exports: [HOTEL_CACHE_SERVICE],
})
export class HotelCacheModule {}
