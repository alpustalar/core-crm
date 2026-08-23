import {
  ConversationAccessDeniedException,
  ConversationNotFoundException,
  ServiceWindowClosedException,
} from '@modules/conversation/domain/exceptions/conversation.exceptions';
import { MessageDirection, MessageStatus, MessageType } from '@shared';
import { SendMessageHandler } from './send-message.handler';
import { SendMessageCommand } from './send-message.command';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/conversation/domain/repositories/message.repository';
import { SendMessageProducer } from '@modules/conversation/infrastructure/queue/producers/send-message.producer';
import { IAiMemoryCacheService } from '@modules/ai-agent/domain/interfaces/ai-memory-cache.service.interface';

describe('SendMessageHandler (giden mesaj QUEUED + kuyruğa al)', () => {
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

    const handler = new SendMessageHandler(
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

  /** Servis penceresi açık (yeni gelen mesaj) yazışma. */
  const conversation = () => {
    const c = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    c.recordInboundMessage({ messageId: 'in-1', body: 'merhaba' });
    c.clearDomainEvents();
    return c;
  };

  it('yazışma bulunamazsa ConversationNotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-1',
          input: { conversationId: 'c-x' },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ConversationNotFoundException);
  });

  it('aktör başka kliniğin id\'siyle çağırırsa kapıda reddedilir', async () => {
    // Dış katman: URL'deki klinik aktörün kapsamında değil. Bu kontrol olmadan
    // herhangi bir oturum, başka kliniğin adına mesaj gönderebilirdi.
    const { handler } = build(conversation());
    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-OTHER',
          input: { conversationId: 'c-1' },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ConversationAccessDeniedException);
  });

  it('yazışma başka kliniğe aitse "bulunamadı" döner (varlık sızdırılmaz)', async () => {
    // İç katman: aktör kliniğine ait bir URL kullanıyor ama yazışma o kliniğin
    // değil. Kapı kontrolü bunu yakalayamaz — iki katman da gerekli.
    // 403 DEĞİL 404: aksi halde başka kiracının yazışma id'leri doğrulanabilirdi.
    const foreign = Conversation.start({
      clinicId: 'clinic-OTHER',
      organizationId: 'org-1',
      contactPhone: '+905550009988',
    });
    const { handler } = build(foreign);
    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-1',
          input: { conversationId: foreign.id },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ConversationNotFoundException);
  });

  it('OUTBOUND mesaj QUEUED persist edilir ve kuyruğa alınır', async () => {
    const conv = conversation();
    const { handler, sendMessageProducer, getSavedMessage } = build(conv);

    const id = await handler.execute(
      new SendMessageCommand({
        clinicId: 'clinic-1',
        input: {
          conversationId: conv.id,
          type: MessageType.TEXT,
          body: 'yanıt',
        },
        ctx,
      })
    );

    const saved = getSavedMessage()!;
    expect(saved.id).toBe(id);
    expect(saved.direction).toBe(MessageDirection.OUTBOUND);
    expect(saved.status).toBe(MessageStatus.QUEUED);
    expect(saved.sentByUserId).toBe('user-1');
    expect(sendMessageProducer.enqueueSend).toHaveBeenCalledWith(id);
  });

  it('24s pencere kapalıyken serbest (TEXT) mesaj reddedilir', async () => {
    // Hiç gelen mesajı olmayan yazışma → pencere kapalı.
    const closed = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    const { handler, sendMessageProducer } = build(closed);

    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-1',
          input: {
            conversationId: closed.id,
            type: MessageType.TEXT,
            body: 'selam',
          },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ServiceWindowClosedException);
    expect(sendMessageProducer.enqueueSend).not.toHaveBeenCalled();

    // Frontend mesaj kutusunu kilitleyip kullanıcıyı şablona yönlendirirken bu
    // payload'a bakıyor; boş kalırsa ekran hangi yazışma olduğunu bilemez.
    let error!: ServiceWindowClosedException;
    try {
      await handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-1',
          input: {
            conversationId: closed.id,
            type: MessageType.TEXT,
            body: 'selam',
          },
          ctx,
        })
      );
    } catch (caught) {
      error = caught as ServiceWindowClosedException;
    }

    expect(error.errorCode).toBe('MESSAGING.SERVICE_WINDOW_CLOSED');
    expect(error.meta).toEqual({
      conversationId: closed.id,
      // Hiç gelen mesaj yok → pencereyi açan bir an da yok.
      lastInboundAt: null,
    });
  });
});
