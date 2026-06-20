import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ConversationRepositoryModule } from '@modules/messaging/conversation/infrastructure/persistence/prisma/repositories/conversation.repository.module';
import { MetaMessageChannelModule } from '@modules/messaging/conversation/infrastructure/adapters/meta/meta-message-channel.module';
import { SendMessageProducer } from './producers/send-message.producer';
import { MessageDeliveryProcessor } from './processors/message-delivery.processor';

/**
 * Outbound mesaj kuyruğu: producer (enqueue) + processor (worker) + aktif kanal adapter
 * (Meta WhatsApp). Cross-context credential query'si global TSQueryBus üzerinden çözülür.
 */
@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.MESSAGING }),
    ConversationRepositoryModule,
    MetaMessageChannelModule,
  ],
  providers: [SendMessageProducer, MessageDeliveryProcessor],
  exports: [SendMessageProducer],
})
export class MessagingQueueModule {}
