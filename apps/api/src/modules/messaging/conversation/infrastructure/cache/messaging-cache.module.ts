import { Module } from '@nestjs/common';
import { MESSAGING_CACHE_SERVICE } from '@modules/messaging/conversation/domain/interfaces/messaging-cache.service.interface';
import { MessagingCacheService } from './messaging-cache.service';

/**
 * Messaging Redis servisleri (webhook dedup kilidi, klinik gönderim kotası, yazışma
 * teslim mutex'i). Redis istemcisi `RedisCoreModule` tarafından global sağlandığı için
 * ek import gerekmez.
 */
@Module({
  providers: [
    { provide: MESSAGING_CACHE_SERVICE, useClass: MessagingCacheService },
  ],
  exports: [MESSAGING_CACHE_SERVICE],
})
export class MessagingCacheModule {}
