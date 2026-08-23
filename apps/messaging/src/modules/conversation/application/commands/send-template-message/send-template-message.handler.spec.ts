import { MessageStatus, MessageType } from '@shared';
import { SendTemplateMessageHandler } from './send-template-message.handler';
import { SendTemplateMessageCommand } from './send-template-message.command';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/conversation/domain/repositories/message.repository';
import { SendMessageProducer } from '@modules/conversation/infrastructure/queue/producers/send-message.producer';
import { IAiMemoryCacheService } from '@modules/ai-agent/domain/interfaces/ai-memory-cache.service.interface';
import {
  ConversationAccessDeniedException,
  ConversationNotFoundException,
  MarketingOptOutException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';

describe('SendTemplateMessageHandler (HSM — 24s penceresine tabi değil)', () => {
  // Aktör bu kliniğe ait — `assertActorCanAccessClinic` kapıda bunu doğruluyor.
  const ctx = {
    actor: { userId: 'user-1', clinicId: 'clinic-1', rolePriority: 10 },
  } as never;

  const build = (conversation: Conversation | null) => {
    let savedMessage: Message | undefined;

    // Pencere/opt-out kontrolü yazma kararını verdiği için okuma command repo'dan.
    const conversationCommandRepo = {
      findById: jest.fn().mockResolvedValue(conversation),
    } as unknown as IConversationCommandRepository;

    const messageCommandRepo = {
      create: jest.fn(async (m: Message) => {
        savedMessage = m;
        return m;
      }),
    } as unknown as IMessageCommandRepository;

    const sendMessageProducer = {
      enqueueSend: jest.fn().mockResolvedValue(undefined),
    } as unknown as SendMessageProducer;

    const aiMemoryCache = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as IAiMemoryCacheService;

    const handler = new SendTemplateMessageHandler(
      conversationCommandRepo,
      messageCommandRepo,
      aiMemoryCache,
      sendMessageProducer
    );
    return {
      handler,
      sendMessageProducer,
      aiMemoryCache,
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

  it('opt-out kontağa MARKETING şablonu gönderilemez ve HİÇBİR ŞEY yazılmaz', async () => {
    // Uyum (compliance) kuralı: hata fırlatmak yetmez — mesaj kaydı açılmış ya da
    // kuyruğa düşmüş olsaydı gönderim yine gerçekleşirdi. Bu test kontrolün
    // yazmadan ÖNCE olduğunu sabitler.
    const conv = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    conv.optOutMarketing();

    const { handler, sendMessageProducer, getSavedMessage } = build(conv);

    await expect(
      handler.execute(
        new SendTemplateMessageCommand({
          clinicId: 'clinic-1',
          input: {
            conversationId: conv.id,
            templateName: 'kampanya_duyuru',
            languageCode: 'tr',
            category: 'marketing',
          },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(MarketingOptOutException);

    expect(getSavedMessage()).toBeUndefined();
    expect(sendMessageProducer.enqueueSend).not.toHaveBeenCalled();
  });

  it('başka kliniğin yazışması "bulunamadı" döner (varlık sızdırılmaz)', async () => {
    // Aktör kendi kliniğinin URL'ini kullanıyor, yazışma başka kliniğin.
    // 403 DEĞİL 404: aksi halde kiracılar arası yazışma id'si doğrulanabilirdi.
    const foreign = Conversation.start({
      clinicId: 'clinic-OTHER',
      organizationId: 'org-1',
      contactPhone: '+905550009988',
    });
    const { handler } = build(foreign);

    await expect(
      handler.execute(
        new SendTemplateMessageCommand({
          clinicId: 'clinic-1',
          input: {
            conversationId: foreign.id,
            templateName: 'randevu_hatirlatma',
            languageCode: 'tr',
          },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ConversationNotFoundException);
  });

});
