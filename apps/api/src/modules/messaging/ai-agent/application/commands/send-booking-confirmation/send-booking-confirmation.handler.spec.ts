import { SendBookingConfirmationHandler } from './send-booking-confirmation.handler';
import { SendBookingConfirmationCommand } from './send-booking-confirmation.command';
import { IAiChatPort } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import {
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { SendMessageCommand } from '@modules/messaging/conversation/application/commands/send-message/send-message.command';
import { SendTemplateMessageCommand } from '@modules/messaging/conversation/application/commands/send-template-message/send-template-message.command';
import { BOOKING_CONFIRMATION_TEMPLATE_NAME } from '@modules/messaging/ai-agent/infrastructure/adapters/ai-chat.constants';

describe('SendBookingConfirmationHandler — (b) ödeme sonrası onay', () => {
  const cmd = new SendBookingConfirmationCommand({
    clinicId: 'clinic-1',
    conversationId: 'conv-1',
    bookingType: 'HOTEL',
    reference: 'BK-REF-1',
    summary: 'Otel Bir (2026-07-01 → 2026-07-05)',
  });

  const makeConversation = (overrides: {
    channel?: string;
    withinWindow?: boolean;
  }): Conversation =>
    ({
      id: 'conv-1',
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      channel: overrides.channel ?? 'WHATSAPP',
      contactName: 'Ali',
      contactPhone: '+905550001122',
      patientId: null,
      leadId: 'lead-1',
      isWithinServiceWindow: () => overrides.withinWindow ?? true,
    }) as unknown as Conversation;

  const build = (opts: {
    conversation: Conversation | null;
    config?: unknown;
    aiText?: string | null;
  }) => {
    const chatPort = {
      generateReply: jest.fn(async () => ({
        text: opts.aiText ?? 'Harika haber! Rezervasyonunuz onaylandı 🎉',
        handoff: false,
        toolsUsed: [],
      })),
    } as unknown as IAiChatPort;

    const conversationQueryRepo = {
      findById: jest.fn(async () => opts.conversation),
    } as unknown as IConversationQueryRepository;

    const messageQueryRepo = {
      findManyByConversation: jest.fn(async () => ({
        items: [{ body: 'merhaba', direction: 'INBOUND' }],
        total: 1,
      })),
    } as unknown as IMessageQueryRepository;

    const commandBus = {
      execute: jest.fn(async () => 'msg-1'),
    } as unknown as TSCommandBus;

    const queryBus = {
      execute: jest.fn(async () => ({
        data:
          opts.config === undefined
            ? {
                isEnabled: true,
                provider: 'ANTHROPIC',
                model: 'claude-haiku-4-5',
                systemPrompt: null,
                maxTokens: 512,
                replyOnlyWithinWindow: false,
                apiKey: 'sk-test',
              }
            : opts.config,
      })),
    } as unknown as TSQueryBus;

    return {
      handler: new SendBookingConfirmationHandler(
        chatPort,
        conversationQueryRepo,
        messageQueryRepo,
        commandBus,
        queryBus
      ),
      chatPort,
      commandBus,
    };
  };

  it('WhatsApp + pencere içi → AI metni TEXT olarak gönderilir', async () => {
    const { handler, chatPort, commandBus } = build({
      conversation: makeConversation({ channel: 'WHATSAPP', withinWindow: true }),
    });

    await handler.execute(cmd);

    expect(chatPort.generateReply).toHaveBeenCalledTimes(1);
    const sent = (commandBus.execute as jest.Mock).mock
      .calls[0][0] as SendMessageCommand;
    expect(sent).toBeInstanceOf(SendMessageCommand);
    expect(sent.input.body).toBe('Harika haber! Rezervasyonunuz onaylandı 🎉');
  });

  it('WhatsApp + pencere dışı → onaylı şablon (HSM) gönderilir, AI çağrılmaz', async () => {
    const { handler, chatPort, commandBus } = build({
      conversation: makeConversation({
        channel: 'WHATSAPP',
        withinWindow: false,
      }),
    });

    await handler.execute(cmd);

    expect(chatPort.generateReply).not.toHaveBeenCalled();
    const sent = (commandBus.execute as jest.Mock).mock
      .calls[0][0] as SendTemplateMessageCommand;
    expect(sent).toBeInstanceOf(SendTemplateMessageCommand);
    expect(sent.input.templateName).toBe(BOOKING_CONFIRMATION_TEMPLATE_NAME);
    expect(sent.input.variables).toEqual([
      'Otel Bir (2026-07-01 → 2026-07-05)',
      'BK-REF-1',
    ]);
  });

  it('Telegram → pencere yok, AI metni gönderilir', async () => {
    const { handler, chatPort, commandBus } = build({
      conversation: makeConversation({ channel: 'TELEGRAM', withinWindow: false }),
    });

    await handler.execute(cmd);
    expect(chatPort.generateReply).toHaveBeenCalledTimes(1);
    expect(
      (commandBus.execute as jest.Mock).mock.calls[0][0]
    ).toBeInstanceOf(SendMessageCommand);
  });

  it('AI config yoksa fallback metin gönderilir (AI çağrılmaz)', async () => {
    const { handler, chatPort, commandBus } = build({
      conversation: makeConversation({ channel: 'TELEGRAM' }),
      config: null,
    });

    await handler.execute(cmd);
    expect(chatPort.generateReply).not.toHaveBeenCalled();
    const sent = (commandBus.execute as jest.Mock).mock
      .calls[0][0] as SendMessageCommand;
    expect(sent.input.body).toContain('BK-REF-1');
  });

  it('yazışma bulunamazsa hiçbir şey gönderilmez', async () => {
    const { handler, commandBus } = build({ conversation: null });
    await handler.execute(cmd);
    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
