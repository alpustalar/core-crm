import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { MessageDirection, MessageType } from '@prisma/client';
import { PaginationSchema } from '@shared';
import {
  MESSAGING_AI_JOBS,
  MESSAGING_AI_RATE_DURATION_MS,
  MESSAGING_AI_RATE_MAX,
  QUEUES,
} from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  AI_CHAT_PORT,
  AiChatMessage,
  IAiChatPort,
} from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { GetAiAgentRuntimeConfigQuery } from '@modules/messaging/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.query';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Message as IMessage } from '@shared';
import { SendMessageCommand } from '@modules/messaging/conversation/application/commands/send-message/send-message.command';
import { RequestConversationHandoffCommand } from '@modules/messaging/conversation/application/commands/request-conversation-handoff/request-conversation-handoff.command';
import { AiReplyJobData } from '../producers/ai-reply.producer';

/** AI bağlamına alınacak son mesaj sayısı (token maliyeti için sınırlı). */
const AI_HISTORY_LIMIT = 20;

/**
 * Gelen mesaja AI otomatik yanıt işleyicisi. Guard'lardan geçen (etkin config, OPEN +
 * atanmamış yazışma, açık servis penceresi) yazışmalarda sohbet geçmişini derler,
 * IAiChatPort ile yanıt üretir ve SendMessageCommand ile gönderir; AI insana devir
 * istediyse RequestConversationHandoffCommand dispatch eder. Tüm komutlar sistem
 * context'i (SYSTEM_ACTOR) ile çalışır.
 */
@Processor(QUEUES.MESSAGING_AI, {
  limiter: {
    max: MESSAGING_AI_RATE_MAX,
    duration: MESSAGING_AI_RATE_DURATION_MS,
  },
})
export class AiReplyProcessor extends WorkerHost {
  private readonly logger = new Logger(AiReplyProcessor.name);

  constructor(
    @Inject(AI_CHAT_PORT)
    private readonly chatPort: IAiChatPort,
    // Yazışma okuması dış gönderim kararını (servis penceresi / AI uygunluğu)
    // besliyor → bayat okunmamalı, Command Context'ten gelir.
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {
    super();
  }

  async process(job: Job<AiReplyJobData>): Promise<void> {
    switch (job.name) {
      case MESSAGING_AI_JOBS.GENERATE_REPLY:
        await this.handleGenerateReply(job);
        break;
      default:
        this.logger.warn(`Bilinmeyen AI job'u: ${job.name}`);
    }
  }

  private async handleGenerateReply(job: Job<AiReplyJobData>): Promise<void> {
    const { conversationId } = job.data;

    const conversation =
      await this.conversationCommandRepo.findById(conversationId);
    if (!conversation) {
      this.logger.warn(
        `Yazışma bulunamadı, AI yanıtı atlanıyor: ${conversationId}`
      );
      return;
    }

    // Guard: insan devraldı/devredildi (PENDING/CLOSED), atanmış veya opt-out → AI susar.
    if (!conversation.isEligibleForAiReply()) return;

    const { data: config } = await this.queryBus.execute(
      new GetAiAgentRuntimeConfigQuery(conversation.clinicId)
    );
    if (!config || !config.isEnabled) return;

    // Guard: pencere-içi kısıtı açık ve servis penceresi kapalıysa atla (template gerekir).
    if (config.replyOnlyWithinWindow && !conversation.isWithinServiceWindow()) {
      return;
    }

    const pagination = PaginationSchema.parse({
      page: 1,
      limit: AI_HISTORY_LIMIT,
    });
    const { items } = await this.messageQueryRepo.findManyByConversation(
      conversationId,
      pagination
    );
    // findMany createdAt desc döner → kronolojik (eski→yeni) için ters çevir.
    const history = this.buildHistory([...items].reverse());
    if (history.length === 0) return;

    const result = await this.chatPort.generateReply({
      clinicId: conversation.clinicId,
      organizationId: conversation.organizationId,
      conversationId: conversation.id,
      channel: conversation.channel,
      provider: config.provider,
      model: config.model,
      systemPrompt: config.systemPrompt,
      apiKey: config.apiKey,
      maxTokens: config.maxTokens,
      history,
      contactName: conversation.contactName,
      contactPhone: conversation.contactPhone,
      patientId: conversation.patientId,
      leadId: conversation.leadId,
    });

    const ctx = ExecutionContextFactory.createInternal();

    if (result.text) {
      await this.commandBus.execute(
        new SendMessageCommand({
          clinicId: conversation.clinicId,
          input: {
            conversationId: conversation.id,
            type: MessageType.TEXT,
            body: result.text,
          },
          ctx,
        })
      );
    }

    if (result.handoff) {
      await this.commandBus.execute(
        new RequestConversationHandoffCommand({
          clinicId: conversation.clinicId,
          conversationId: conversation.id,
          ctx,
        })
      );
    }
  }

  /**
   * Mesajları geçerli bir Anthropic sohbet dizisine çevirir: yalnız metinli mesajlar,
   * INBOUND→user / OUTBOUND→assistant; baştaki assistant mesajları atılır (ilk mesaj
   * user olmalı) ve ardışık aynı-rol mesajlar birleştirilir.
   */
  private buildHistory(
    messages: IMessage[]): AiChatMessage[] {
    const mapped: AiChatMessage[] = [];
    for (const m of messages) {
      const body = m.body?.trim();
      if (!body) continue;
      const role =
        m.direction === MessageDirection.INBOUND ? 'user' : 'assistant';
      mapped.push({ role, content: body });
    }

    // İlk mesaj user olmalı (Anthropic kuralı).
    while (mapped.length > 0 && mapped[0].role !== 'user') {
      mapped.shift();
    }

    // Ardışık aynı-rol mesajları birleştir.
    const normalized: AiChatMessage[] = [];
    for (const msg of mapped) {
      const last = normalized[normalized.length - 1];
      if (last && last.role === msg.role) {
        last.content = `${last.content}\n${msg.content}`;
      } else {
        normalized.push({ ...msg });
      }
    }
    return normalized;
  }
}
