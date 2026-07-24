import { Module } from '@nestjs/common';
import { NotificationRealtimeBridge } from './notification-realtime.bridge';

/**
 * Real-time köprüsünü tek bir singleton olarak sağlar; hem event modülü (yayın)
 * hem presentation modülü (SSE stream) bu modülü import ederek aynı in-memory
 * Subject havuzunu paylaşır.
 */
@Module({
  providers: [NotificationRealtimeBridge],
  exports: [NotificationRealtimeBridge],
})
export class NotificationRealtimeModule {}
