import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { QUEUES } from '@common/constants';
import { ConversationRepositoryModule } from '@modules/conversation/infrastructure/persistence/mongo/repositories/conversation.repository.module';
import { AiAgentQueryModule } from '@modules/ai-agent/application/queries/query.module';
import { SendBookingConfirmationHandler } from '@modules/ai-agent/application/commands/send-booking-confirmation/send-booking-confirmation.handler';
import { AiChatModule } from './adapters/ai-chat.module';
import { AiMemoryCacheModule } from './cache/ai-memory-cache.module';
import { AiReplyProducer } from './queue/producers/ai-reply.producer';
import { AiReplyProcessor } from './queue/processors/ai-reply.processor';
import { AiReplyListener } from './events/listeners/ai-reply.listener';

/**
 * AI otomatik yanıt akışı: MessageReceivedEvent → AiReplyListener (enabled guard) →
 * MESSAGING_AI kuyruğu (producer) → AiReplyProcessor (worker) → IAiChatPort + araçlar
 * → SendMessageCommand / handoff. Komut/sorgu dağıtımı global TSCommandBus/TSQueryBus
 * üzerinden; runtime config + conversation/message repoları buradan sağlanır.
 */
@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: QUEUES.MESSAGING_AI }),
    ConversationRepositoryModule,
    AiAgentQueryModule,
    AiChatModule,
    AiMemoryCacheModule,
  ],
  providers: [
    AiReplyListener,
    AiReplyProducer,
    AiReplyProcessor,
    SendBookingConfirmationHandler,
  ],
})
export class AiReplyModule {}
