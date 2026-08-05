import { MessageStatus, MessageType } from '@prisma/client';
import { SendTemplateMessageHandler } from './send-template-message.handler';
import { SendTemplateMessageCommand } from './send-template-message.command';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { IConversationQueryRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { SendMessageProducer } from '@modules/messaging/conversation/infrastructure/queue/producers/send-message.producer';

describe('SendTemplateMessageHandler (HSM — 24s penceresine tabi değil)', () => {
  const ctx = { actor: { userId: 'user-1' } } as never;

  const build = (conversation: Conversation | null) => {
    let savedMessage: Message | undefined;

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(conversation),
      findByContact: jest.fn(),
      findMany: jest.fn(),
    } as unknown as IConversationQueryRepository;

    const messageCommandRepo = {
      create: jest.fn(async (m: Message) => {
        savedMessage = m;
        return m;
      }),
    } as unknown as IMessageCommandRepository;

    const sendMessageProducer = {
      enqueueSend: jest.fn().mockResolvedValue(undefined),
    } as unknown as SendMessageProducer;

    const handler = new SendTemplateMessageHandler(
      conversationQueryRepo,
      messageCommandRepo,
      sendMessageProducer
    );
    return {
      handler,
      sendMessageProducer,
      getSavedMessage: () => savedMessage,
    };
  };

  it('pencere KAPALI olsa bile TEMPLATE mesaj QUEUED + kuyruğa al', async () => {
    // Hiç gelen mesajı olmayan yazışma (pencere kapalı) — yine de şablon gönderilebilir.
    const conv = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    const { handler, sendMessageProducer, getSavedMessage } = build(conv);

    const id = await handler.execute(
      new SendTemplateMessageCommand({
        clinicId: 'clinic-1',
        input: {
          conversationId: conv.id,
          templateName: 'randevu_hatirlatma',
          languageCode: 'tr',
          variables: ['Ada', '14:00'],
        },
        ctx,
      })
    );

    const saved = getSavedMessage()!;
    expect(saved.id).toBe(id);
    expect(saved.type).toBe(MessageType.TEMPLATE);
    expect(saved.status).toBe(MessageStatus.QUEUED);
    expect(saved.templateName).toBe('randevu_hatirlatma');
    expect(saved.templateLanguage).toBe('tr');
    expect(saved.templateVariables).toEqual(['Ada', '14:00']);
    expect(sendMessageProducer.enqueueSend).toHaveBeenCalledWith(id);
  });

  it('header media + URL buton parametreleri templateComponents olarak saklanır', async () => {
    const conv = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    const { handler, getSavedMessage } = build(conv);

    await handler.execute(
      new SendTemplateMessageCommand({
        clinicId: 'clinic-1',
        input: {
          conversationId: conv.id,
          templateName: 'kampanya',
          languageCode: 'tr',
          variables: ['Ada'],
          headerMediaUrl: 'https://cdn/x.jpg',
          headerMediaType: 'image',
          buttonParams: ['promo123'],
        },
        ctx,
      })
    );

    const components = getSavedMessage()!.templateComponents;
    expect(components.bodyParams).toEqual(['Ada']);
    expect(components.headerMediaUrl).toBe('https://cdn/x.jpg');
    expect(components.headerMediaType).toBe('image');
    expect(components.urlButtonParams).toEqual(['promo123']);
  });
});
