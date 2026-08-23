import { Module } from '@nestjs/common';
import { TransferCacheService } from './transfer-cache.service';
import { TRANSFER_CACHE_SERVICE } from '@modules/crm/health-tourism/transfer/domain/interfaces/transfer-cache.service.interface';

/**
 * Transfer modülünün Redis cache servisini (availability + rate-option token'ları)
 * sağlar. Cache'e erişen command/query handler'ları bu modülü import eder —
 * cross-module kuralı gereği dış modüller cache'e doğrudan değil, bus üzerinden gider.
 *
 * Sağlama token üzerinden: tüketiciler sınıfa değil `ITransferCacheService`
 * soyutlamasına bağlanır (repository token deseninin aynısı).
 */
@Module({
  providers: [
    { provide: TRANSFER_CACHE_SERVICE, useClass: TransferCacheService },
  ],
  exports: [TRANSFER_CACHE_SERVICE],
})
export class TransferCacheModule {}
