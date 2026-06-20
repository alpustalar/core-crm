import { Job } from 'bullmq';
import { MessageStatus, MessageType } from '@prisma/client';
import { MESSAGING_JOBS, MESSAGING_SEND_MAX_ATTEMPTS } from '@common/constants';
import { MessageDeliveryProcessor } from './message-delivery.processor';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { MessageChannelPort } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import {
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import {
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('MessageDeliveryProcessor (outbound teslim worker)', () => {
  const build = (params: {
    message: Message | null;
    conversation?: Conversation | null;
    sendImpl?: jest.Mock;
  }) => {
    const channel = {
      send:
        params.sendImpl ??
        jest.fn().mockResolvedValue({ externalId: 'wamid.sent.1' }),
    } as unknown as MessageChannelPort;

    const messageQueryRepo = {
      findById: jest.fn().mockResolvedValue(params.message),
      findByExternalId: jest.fn(),
      findManyByConversation: jest.fn(),
    } as unknown as IMessageQueryRepository;

    const messageCommandRepo = {
      save: jest.fn(async (m: Message) => m),
    } as unknown as IMessageCommandRepository;

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(params.conversation ?? null),
      findByContact: jest.fn(),
      findMany: jest.fn(),
    } as unknown as IConversationQueryRepository;

    const conversationCommandRepo = {
      save: jest.fn(async (c: Conversation) => c),
    } as unknown as IConversationCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const processor = new MessageDeliveryProcessor(
      channel,
      messageQueryRepo,
      messageCommandRepo,
      conversationQueryRepo,
      conversationCommandRepo,
      txManager
    );
    return { processor, channel, messageCommandRepo };
  };

  const job = (messageId: string, attemptsMade = 0): Job =>
    ({
      name: MESSAGING_JOBS.SEND_MESSAGE,
      data: { messageId },
      attemptsMade,
    }) as unknown as Job;

  const queuedOutbound = () =>
    Message.createOutbound({ conversationId: 'conv-1', body: 'yanıt' });

  const conversation = () =>
    Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });

  it('QUEUED mesaj gönderilir → SENT + externalId', async () => {
    const message = queuedOutbound();
    const { processor, channel } = build({
      message,
      conversation: conversation(),
    });

    await processor.process(job(message.id));

    expect(channel.send).toHaveBeenCalledTimes(1);
    expect(message.status).toBe(MessageStatus.SENT);
    expect(message.externalId).toBe('wamid.sent.1');
  });

  it('idempotency: QUEUED olmayan mesaj tekrar gönderilmez', async () => {
    const message = queuedOutbound();
    message.markSent('wamid.x'); // artık SENT
    const { processor, channel } = build({
      message,
      conversation: conversation(),
    });

    await processor.process(job(message.id));
    expect(channel.send).not.toHaveBeenCalled();
  });

  it('son denemede hata → FAILED işaretlenir ve hata yeniden fırlatılır', async () => {
    const message = queuedOutbound();
    const sendImpl = jest.fn().mockRejectedValue(new Error('Meta 500'));
    const { processor, messageCommandRepo } = build({
      message,
      conversation: conversation(),
      sendImpl,
    });

    await expect(
      processor.process(job(message.id, MESSAGING_SEND_MAX_ATTEMPTS - 1))
    ).rejects.toThrow('Meta 500');

    expect(message.status).toBe(MessageStatus.FAILED);
    expect(message.errorReason).toBe('Meta 500');
    expect(messageCommandRepo.save).toHaveBeenCalled();
  });

  it('ara denemede hata → FAILED YOK, hata fırlatılır (retry için)', async () => {
    const message = queuedOutbound();
    const sendImpl = jest.fn().mockRejectedValue(new Error('geçici'));
    const { processor } = build({
      message,
      conversation: conversation(),
      sendImpl,
    });

    await expect(processor.process(job(message.id, 0))).rejects.toThrow(
      'geçici'
    );
    expect(message.status).toBe(MessageStatus.QUEUED);
  });
});
