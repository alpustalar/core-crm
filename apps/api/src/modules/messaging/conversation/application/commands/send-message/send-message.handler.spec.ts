import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageDirection, MessageStatus, MessageType } from '@prisma/client';
import { SendMessageHandler } from './send-message.handler';
import { SendMessageCommand } from './send-message.command';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import {
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { MessageChannelPort } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('SendMessageHandler (giden mesaj — port stub)', () => {
  const ctx = { actor: { userId: 'user-1' } } as never;

  const build = (conversation: Conversation | null) => {
    let lastSavedMessage: Message | undefined;

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(conversation),
      findByContact: jest.fn(),
      findMany: jest.fn(),
    } as unknown as IConversationQueryRepository;

    const conversationCommandRepo = {
      save: jest.fn(async (c: Conversation) => c),
    } as unknown as IConversationCommandRepository;

    const messageCommandRepo = {
      save: jest.fn(async (m: Message) => {
        lastSavedMessage = m;
        return m;
      }),
    } as unknown as IMessageCommandRepository;

    const channel = {
      send: jest.fn().mockResolvedValue({ externalId: 'wamid.out.1' }),
    } as unknown as MessageChannelPort;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new SendMessageHandler(
      conversationQueryRepo,
      conversationCommandRepo,
      messageCommandRepo,
      channel,
      txManager
    );

    return { handler, channel, getLastSavedMessage: () => lastSavedMessage };
  };

  const conversation = () =>
    Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });

  it('yazışma bulunamazsa NotFoundException', async () => {
    const { handler } = build(null);
    await expect(
      handler.execute(
        new SendMessageCommand('clinic-1', { conversationId: 'c-x' }, ctx)
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('yazışma başka kliniğe aitse ForbiddenException', async () => {
    const { handler } = build(conversation());
    await expect(
      handler.execute(
        new SendMessageCommand('clinic-OTHER', { conversationId: 'c-1' }, ctx)
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('OUTBOUND mesaj QUEUED→SENT olur, port çağrılır, externalId yazılır', async () => {
    const conv = conversation();
    const { handler, channel, getLastSavedMessage } = build(conv);

    const id = await handler.execute(
      new SendMessageCommand(
        'clinic-1',
        { conversationId: conv.id, type: MessageType.TEXT, body: 'yanıt' },
        ctx
      )
    );

    expect(channel.send).toHaveBeenCalledTimes(1);
    const saved = getLastSavedMessage()!;
    expect(saved.id).toBe(id);
    expect(saved.direction).toBe(MessageDirection.OUTBOUND);
    expect(saved.status).toBe(MessageStatus.SENT);
    expect(saved.externalId).toBe('wamid.out.1');
    expect(saved.sentByUserId).toBe('user-1');
  });
});
