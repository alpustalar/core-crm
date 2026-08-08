import { MessageStatus } from '@shared';
import { MarkMessageStatusHandler } from './mark-message-status.handler';
import { MarkMessageStatusCommand } from './mark-message-status.command';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { IMessageCommandRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { IConversationCommandRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';

describe('MarkMessageStatusHandler (webhook teslim durumu)', () => {
  const build = (message: Message | null) => {
    // Durum geçişini besleyen okuma kilitli ve command repo'dan: teslim webhook'ları
    // (sent/delivered/read) aynı mesaj için eşzamanlı ve sırasız gelir.
    const messageCommandRepo = {
      findByExternalIdForUpdate: jest.fn().mockResolvedValue(message),
      update: jest.fn(async (m: Message) => m),
    } as unknown as IMessageCommandRepository;

    const conversationCommandRepo = {
      findByIdForUpdate: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    } as unknown as IConversationCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as MongoTransactionManager;

    const handler = new MarkMessageStatusHandler(
      messageCommandRepo,
      conversationCommandRepo,
      txManager
    );
    return { handler, messageCommandRepo, txManager };
  };

  const sentOutbound = () => {
    const m = Message.createOutbound({ conversationId: 'c-1', body: 'x' });
    m.markSent('wamid.out.1');
    m.clearDomainEvents();
    return m;
  };

  it('bilinmeyen externalId → no-op (update çağrılmaz)', async () => {
    const { handler, messageCommandRepo } = build(null);
    await handler.execute(
      new MarkMessageStatusCommand({
        externalId: 'wamid.unknown',
        status: MessageStatus.DELIVERED,
      })
    );
    expect(messageCommandRepo.update).not.toHaveBeenCalled();
  });

  it('okuma da transaction içinde yapılır (kilit etkili olsun diye)', async () => {
    const { handler, messageCommandRepo, txManager } = build(sentOutbound());

    await handler.execute(
      new MarkMessageStatusCommand({
        externalId: 'wamid.out.1',
        status: MessageStatus.DELIVERED,
      })
    );

    expect(txManager.run).toHaveBeenCalledTimes(1);
    expect(messageCommandRepo.findByExternalIdForUpdate).toHaveBeenCalledWith(
      'wamid.out.1'
    );
  });

  it('SENT mesaj DELIVERED olur', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand({
        externalId: 'wamid.out.1',
        status: MessageStatus.DELIVERED,
      })
    );
    expect(msg.status).toBe(MessageStatus.DELIVERED);
  });

  it('FAILED durumu errorReason ile işlenir', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand({
        externalId: 'wamid.out.1',
        status: MessageStatus.FAILED,
        errorReason: 'numara WhatsApp kullanmıyor',
      })
    );
    expect(msg.status).toBe(MessageStatus.FAILED);
    expect(msg.errorReason).toBe('numara WhatsApp kullanmıyor');
  });

  it('FAILED durumu errorCode ile işlenir', async () => {
    const msg = sentOutbound();
    const { handler } = build(msg);
    await handler.execute(
      new MarkMessageStatusCommand({
        externalId: 'wamid.out.1',
        status: MessageStatus.FAILED,
        errorReason: '24s pencere kapalı',
        errorCode: '131047',
      })
    );
    expect(msg.status).toBe(MessageStatus.FAILED);
    expect(msg.errorCode).toBe('131047');
  });
});
