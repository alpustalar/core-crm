import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MessageDirection, MessageStatus, MessageType } from '@shared';
import { SendMessageHandler } from './send-message.handler';
import { SendMessageCommand } from './send-message.command';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { IConversationCommandRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { SendMessageProducer } from '@modules/messaging/conversation/infrastructure/queue/producers/send-message.producer';
import { IAiMemoryCacheService } from '@modules/messaging/ai-agent/domain/interfaces/ai-memory-cache.service.interface';

describe('SendMessageHandler (giden mesaj QUEUED + kuyruğa al)', () => {
  const ctx = { actor: { userId: 'user-1' } } as never;

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

  it('yazışma bulunamazsa NotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-1',
          input: { conversationId: 'c-x' },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('yazışma başka kliniğe aitse ForbiddenException', async () => {
    const { handler } = build(conversation());
    await expect(
      handler.execute(
        new SendMessageCommand({
          clinicId: 'clinic-OTHER',
          input: { conversationId: 'c-1' },
          ctx,
        })
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
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
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sendMessageProducer.enqueueSend).not.toHaveBeenCalled();
  });
});
