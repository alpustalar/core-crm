import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { MessageStatus, MessageType } from '@prisma/client';
import {
  MESSAGING_JOBS,
  MESSAGING_SEND_MAX_ATTEMPTS,
  MESSAGING_SEND_RATE_DURATION_MS,
  MESSAGING_SEND_RATE_MAX,
  QUEUES,
} from '@common/constants';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  MESSAGE_CHANNEL_PORT,
  MessageChannelPort,
} from '@modules/messaging/conversation/domain/ports/message-channel.port';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';

interface SendJobData {
  messageId: string;
}

/**
 * Giden mesaj teslim işleyicisi. QUEUED mesajı yükler, kanal portuna (Meta WhatsApp)
 * iletir; başarıda SENT + son mesaj zamanı güncellenir, hata fırlatılırsa BullMQ retry
 * eder. Son denemede de başarısızsa mesaj FAILED işaretlenir (dead-letter kalır).
 */
@Processor(QUEUES.MESSAGING, {
  limiter: {
    max: MESSAGING_SEND_RATE_MAX,
    duration: MESSAGING_SEND_RATE_DURATION_MS,
  },
})
export class MessageDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageDeliveryProcessor.name);

  constructor(
    @Inject(MESSAGE_CHANNEL_PORT)
    private readonly channel: MessageChannelPort,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    private readonly txManager: TransactionManager
  ) {
    super();
  }

  async process(job: Job<SendJobData>): Promise<void> {
    switch (job.name) {
      case MESSAGING_JOBS.SEND_MESSAGE:
        await this.handleSend(job);
        break;
      default:
        this.logger.warn(`Bilinmeyen messaging job'u: ${job.name}`);
    }
  }

  private async handleSend(job: Job<SendJobData>): Promise<void> {
    const message = await this.messageQueryRepo.findById(job.data.messageId);
    if (!message) {
      this.logger.warn(`Mesaj bulunamadı, atlanıyor: ${job.data.messageId}`);
      return;
    }
    // Idempotency: yalnızca QUEUED mesaj gönderilir (SENT/FAILED tekrar işlenmez).
    if (message.status !== MessageStatus.QUEUED) return;

    const conversation = await this.conversationQueryRepo.findById(
      message.conversationId
    );
    if (!conversation) {
      this.logger.warn(
        `Yazışma bulunamadı, mesaj atlanıyor: ${message.conversationId}`
      );
      return;
    }

    try {
      const result = await this.channel.send({
        channel: conversation.channel,
        clinicId: conversation.clinicId,
        toPhone: conversation.contactPhone,
        type: message.type,
        body: message.body,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        template:
          message.type === MessageType.TEMPLATE && message.templateName
            ? {
                name: message.templateName,
                language: message.templateLanguage ?? 'tr',
                bodyParams: message.templateComponents.bodyParams ?? [],
                headerText: message.templateComponents.headerText,
                headerMediaUrl: message.templateComponents.headerMediaUrl,
                headerMediaType: message.templateComponents.headerMediaType,
                urlButtonParams: message.templateComponents.urlButtonParams,
              }
            : undefined,
      });

      await this.txManager.run(async () => {
        message.markSent(result.externalId);
        await this.messageCommandRepo.save(message);
        conversation.touch();
        await this.conversationCommandRepo.save(conversation);
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Gönderim hatası';
      const isFinalAttempt =
        job.attemptsMade + 1 >= MESSAGING_SEND_MAX_ATTEMPTS;

      if (isFinalAttempt) {
        await this.txManager.run(async () => {
          message.markFailed(reason);
          await this.messageCommandRepo.save(message);
        });
        this.logger.error(
          `Mesaj gönderimi kalıcı başarısız: ${message.id} — ${reason}`
        );
      }
      throw err;
    }
  }
}
