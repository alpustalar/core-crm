import { Module } from '@nestjs/common';
import { TransferCacheService } from './transfer-cache.service';

/**
 * Transfer modülünün Redis cache servisini (availability + rate-option token'ları)
 * sağlar. Cache'e erişen command/query handler'ları bu modülü import eder —
 * cross-module kuralı gereği dış modüller cache'e doğrudan değil, bus üzerinden gider.
 */
@Module({
  providers: [TransferCacheService],
  exports: [TransferCacheService],
})
export class TransferCacheModule {}
