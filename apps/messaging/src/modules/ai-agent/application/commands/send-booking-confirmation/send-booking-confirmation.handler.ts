import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { MessageChannel, MessageDirection, MessageType } from '@shared';
import { PaginationSchema } from '@shared';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import {
  AI_CHAT_PORT,
  AiChatMessage,
  IAiChatPort,
} from '@modules/ai-agent/domain/ports/ai-chat.port';
import { GetAiAgentRuntimeConfigQuery } from '@modules/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.query';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  IConversationCommandRepository,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  IMessageQueryRepository,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { Message as IMessage } from '@shared';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { SendMessageCommand } from '@modules/conversation/application/commands/send-message/send-message.command';
import { SendTemplateMessageCommand } from '@modules/conversation/application/commands/send-template-message/send-template-message.command';
import {
  BOOKING_CONFIRMATION_TEMPLATE_LANG,
  BOOKING_CONFIRMATION_TEMPLATE_NAME,
} from '@modules/ai-agent/infrastructure/adapters/ai-chat.constants';
import {
  SendBookingConfirmationCommand,
  SendBookingConfirmationInput,
} from './send-booking-confirmation.command';

/** Dil tespiti için bağlama alınacak son mesaj sayısı. */
const HISTORY_LIMIT = 20;

@CommandHandler(SendBookingConfirmationCommand)
export class SendBookingConfirmationHandler implements ICommandHandler<
  SendBookingConfirmationCommand,
  void
> {
  private readonly logger = new Logger(SendBookingConfirmationHandler.name);

  constructor(
    @Inject(AI_CHAT_PORT)
    private readonly chatPort: IAiChatPort,
    // Yazışma okuması gönderim yolunu (şablon mu serbest metin mi) belirliyor →
    // 24 saatlik servis penceresi bayat okunmamalı, Command Context'ten gelir.
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationRepo: IConversationCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageRepo: IMessageQueryRepository,
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: SendBookingConfirmationCommand): Promise<void> {
    const { input } = command;
    const conversation = await this.conversationRepo.findById(
      input.conversationId
    );
    if (!conversation) {
      this.logger.warn(
        `Onay mesajı atlandı; yazışma bulunamadı: ${input.conversationId}`
      );
      return;
    }

    const ctx = ExecutionContextFactory.createInternal();

    // WhatsApp + 24s pencere KAPALI → serbest metin reddedilir, onaylı şablon (HSM) gönder.
    if (
      conversation.channel === MessageChannel.WHATSAPP &&
      !conversation.isWithinServiceWindow()
    ) {
      await this.commandBus.execute(
        new SendTemplateMessageCommand({
          clinicId: input.clinicId,
          input: {
            conversationId: conversation.id,
            templateName: BOOKING_CONFIRMATION_TEMPLATE_NAME,
            languageCode: BOOKING_CONFIRMATION_TEMPLATE_LANG,
            variables: [input.summary, input.reference],
          },
          ctx,
        })
      );
      return;
    }

    // Pencere içi / Telegram / Instagram → AI konuşma dilinde onay metni üretir.
    const body =
      (await this.generateConfirmationText(conversation, input)) ??
      this.fallbackText(input);

    await this.commandBus.execute(
      new SendMessageCommand({
        clinicId: input.clinicId,
        input: {
          conversationId: conversation.id,
          type: MessageType.TEXT,
          body,
        },
        ctx,
      })
    );
  }

  /**
   * AI'dan konuşma dilinde kısa bir onay metni üretir. Klinik AI config'i yoksa/kapalıysa
   * ya da metin üretilemezse null döner (çağıran fallback şablon metnine düşer).
   */
  private async generateConfirmationText(
    conversation: Conversation,
    input: SendBookingConfirmationInput
  ): Promise<string | null> {
    const { data: config } = await this.queryBus.execute(
      new GetAiAgentRuntimeConfigQuery(conversation.clinicId)
    );
    if (!config || !config.isEnabled) return null;

    const pagination = PaginationSchema.parse({
      page: 1,
      limit: HISTORY_LIMIT,
    });
    // Salt okunur bağlam (AI prompt geçmişi): hiçbir mutasyona karar vermiyor,
    // Query Repo burada meşru.
    const { items } = await this.messageRepo.findManyByConversation(
      conversation.id,
      pagination
    );
    const history = this.buildHistory([...items].reverse());
    this.appendInstruction(history, input);

    try {
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
      return result.text;
    } catch (err) {
      this.logger.warn(
        `Onay metni üretilemedi (conv=${conversation.id}): ${
          err instanceof Error ? err.message : err
        }`
      );
      return null;
    }
  }

  /** AI'a, son geçmişin ardından onay mesajını yazdıran talimatı (user turn) ekler. */
  private appendInstruction(
    history: AiChatMessage[],
    input: SendBookingConfirmationInput
  ): void {
    const kind = input.bookingType === 'HOTEL' ? 'otel' : 'transfer';
    const instruction =
      `[SİSTEM] Müşterinin ödemesi onaylandı ve ${kind} rezervasyonu oluşturuldu. ` +
      `Rezervasyon: ${input.summary}. Referans: ${input.reference}. ` +
      `Müşteriye bu iyi haberi veren KISA ve sıcak bir onay mesajı yaz; sadece mesajı yaz, araç çağırma.`;

    const last = history[history.length - 1];
    if (last && last.role === 'user') {
      last.content = `${last.content}\n${instruction}`;
    } else {
      history.push({ role: 'user', content: instruction });
    }
  }

  /** AI yoksa kullanılan iki dilli güvenli onay metni. */
  private fallbackText(input: SendBookingConfirmationInput): string {
    return (
      `✅ Ödemeniz alındı, rezervasyonunuz oluşturuldu. (${input.summary}) Referans: ${input.reference}\n` +
      `✅ Your payment was received and your booking is confirmed. Ref: ${input.reference}`
    );
  }

  /** Mesajları AI sohbet dizisine çevirir (processor ile aynı kural: ilk user, ardışık birleştir). */
  private buildHistory(messages: IMessage[]): AiChatMessage[] {
    const mapped: AiChatMessage[] = [];
    for (const m of messages) {
      const body = m.body?.trim();
      if (!body) continue;
      const role =
        m.direction === MessageDirection.INBOUND ? 'user' : 'assistant';
      mapped.push({ role, content: body });
    }
    while (mapped.length > 0 && mapped[0].role !== 'user') mapped.shift();

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
