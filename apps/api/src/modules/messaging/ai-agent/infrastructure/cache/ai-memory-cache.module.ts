import { Module } from '@nestjs/common';
import { AI_MEMORY_CACHE_SERVICE } from '@modules/messaging/ai-agent/domain/interfaces/ai-memory-cache.service.interface';
import { AiMemoryCacheService } from './ai-memory-cache.service';

/**
 * AI sohbet bağlam penceresi cache'i. Yazışma akışındaki command handler'lar pencereyi
 * beslediği için (`append`) conversation tarafından da import edilir.
 */
@Module({
  providers: [
    { provide: AI_MEMORY_CACHE_SERVICE, useClass: AiMemoryCacheService },
  ],
  exports: [AI_MEMORY_CACHE_SERVICE],
})
export class AiMemoryCacheModule {}
