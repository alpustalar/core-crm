import { MessageStatus } from '@prisma/client';
import { MarkMessageStatusHandler } from './mark-message-status.handler';
import { MarkMessageStatusCommand } from './mark-message-status.command';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import {
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('MarkMessageStatusHandler (webhook teslim durumu)', () => {
  const build = (message: Message | null) => {
    const messageQueryRepo = {
      findByExternalId: jest.fn().mockResolvedValue(message),
      findManyByConversation: jest.fn(),
    } as unknown as IMessageQueryRepository;

    const messageCommandRepo = {
      save: jest.fn(async (m: Message) => m),
    } as unknown as IMessageCommandRepository;

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as IConversationQueryRepository;

    const conversationCommandRepo = {
      save: jest.fn(),
    } as unknown as IConversationCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new MarkMessageStatusHandler(
      messageCommandRepo,
      messageQueryRepo,
      conversationQueryRepo,
      conversationCommandRepo,
      txManager
    );
    return { handler, messageCommandRepo };
  };

  const sentOutbound = () => {
    const m = Message.createOutbound({ conversationId: 'c-1', body: 'x' });
    m.markSent('wamid.out.1');
    m.clearDomainEvents();
    return m;
  };

  it('bilinmeyen externalId → no-op (save çağrılmaz)', async () => {
    const { handler, messageCommandRepo } = build(null);
    await handler.execute(
      new MarkMessageStatusCommand('wamid.unknown', MessageStatus.DELIVERED)
    );
    expect(messageCommandRepo.save).not.toHaveBeenCalled();
  });

  it('SENT mesaj DELIVERED olur', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand('wamid.out.1', MessageStatus.DELIVERED)
    );
    expect(msg.status).toBe(MessageStatus.DELIVERED);
  });

  it('FAILED durumu errorReason ile işlenir', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand(
        'wamid.out.1',
        MessageStatus.FAILED,
        'numara WhatsApp kullanmıyor'
      )
    );
    expect(msg.status).toBe(MessageStatus.FAILED);
    expect(msg.errorReason).toBe('numara WhatsApp kullanmıyor');
  });

  it('FAILED durumu errorCode ile işlenir', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand(
        'wamid.out.1',
        MessageStatus.FAILED,
        '24s pencere kapalı',
        '131047'
      )
    );
    expect(msg.status).toBe(MessageStatus.FAILED);
    expect(msg.errorCode).toBe('131047');
  });
});
