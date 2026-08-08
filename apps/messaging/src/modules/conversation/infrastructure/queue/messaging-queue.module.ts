import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ConversationRepositoryModule } from '@modules/conversation/infrastructure/persistence/mongo/repositories/conversation.repository.module';
import { ChannelRouterModule } from '@modules/conversation/infrastructure/adapters/router/channel-router.module';
import { MessagingCacheModule } from '@modules/conversation/infrastructure/cache/messaging-cache.module';
import { SendMessageProducer } from './producers/send-message.producer';
import { MessageDeliveryProcessor } from './processors/message-delivery.processor';

/**
 * Outbound mesaj kuyruğu: producer (enqueue) + processor (worker) + çok-kanal yönlendirici
 * (WhatsApp Meta + Telegram Bot). Cross-context credential query'si global TSQueryBus
 * üzerinden çözülür.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.MESSAGING }),
    ConversationRepositoryModule,
    ChannelRouterModule,
    MessagingCacheModule,
  ],
  providers: [SendMessageProducer, MessageDeliveryProcessor],
  exports: [SendMessageProducer],
})
export class MessagingQueueModule {}
