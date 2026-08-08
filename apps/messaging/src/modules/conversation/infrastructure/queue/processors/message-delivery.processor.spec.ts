import { DelayedError, Job } from 'bullmq';
import { MessageStatus, MessageType } from '@shared';
import { MESSAGING_JOBS, MESSAGING_SEND_MAX_ATTEMPTS } from '@messaging/constants/jobs.constant';
import { MessageDeliveryProcessor } from './message-delivery.processor';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { MessageChannelPort } from '@modules/conversation/domain/ports/message-channel.port';
import { IMessageCommandRepository } from '@modules/conversation/domain/repositories/message.repository';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  DeliveryLockResult,
  IMessagingCacheService,
  SendQuotaResult,
} from '@modules/conversation/domain/interfaces/messaging-cache.service.interface';

describe('MessageDeliveryProcessor (outbound teslim worker)', () => {
  const build = (params: {
    message: Message | null;
    conversation?: Conversation | null;
    /** Kanal çağrısı sonrası kilitli okumada dönen taze yazışma (yarış senaryosu). */
    freshConversation?: Conversation | null;
    sendImpl?: jest.Mock;
    deliveryLock?: DeliveryLockResult;
    sendQuota?: SendQuotaResult;
  }) => {
    let savedConversation: Conversation | undefined;

    const channel = {
      send:
        params.sendImpl ??
        jest.fn().mockResolvedValue({ externalId: 'wamid.sent.1' }),
    } as unknown as MessageChannelPort;

    const messageCommandRepo = {
      findById: jest.fn().mockResolvedValue(params.message),
      findByIdForUpdate: jest.fn().mockResolvedValue(params.message),
      update: jest.fn(async (m: Message) => m),
    } as unknown as IMessageCommandRepository;

    const conversationCommandRepo = {
      // Gönderim öncesi okuma da Command Repo'dan (kanal/servis penceresi kararı).
      findById: jest.fn().mockResolvedValue(params.conversation ?? null),
      findByIdForUpdate: jest
        .fn()
        .mockResolvedValue(
          params.freshConversation ?? params.conversation ?? null
        ),
      update: jest.fn(async (c: Conversation) => {
        savedConversation = c;
        return c;
      }),
    } as unknown as IConversationCommandRepository;

    const txManager = {
      run: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as MongoTransactionManager;

    // Varsayılan: mutex serbest + kota müsait → mevcut senaryolar gönderime devam eder.
    const messagingCache = {
      deliveryLock: {
        acquire: jest
          .fn()
          .mockResolvedValue(params.deliveryLock ?? { status: 'acquired' }),
        release: jest.fn().mockResolvedValue(undefined),
      },
      sendQuota: {
        consume: jest
          .fn()
          .mockResolvedValue(params.sendQuota ?? { status: 'allowed' }),
      },
    } as unknown as IMessagingCacheService;

    const processor = new MessageDeliveryProcessor(
      channel,
      messageCommandRepo,
      conversationCommandRepo,
      messagingCache,
      txManager
    );
    return {
      processor,
      channel,
      messageCommandRepo,
      messagingCache,
      getSavedConversation: () => savedConversation,
    };
  };

  const job = (messageId: string, attemptsMade = 0): Job =>
    ({
      name: MESSAGING_JOBS.SEND_MESSAGE,
      data: { messageId },
      attemptsMade,
      moveToDelayed: jest.fn().mockResolvedValue(undefined),
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

  it('gönderim sırasında gelen mesaj ezilmez: yazışma kilitli ve taze okunup yazılır', async () => {
    const message = queuedOutbound();
    const preSend = conversation();

    // Kanal çağrısı sürerken gelen mesaj düşmüş gibi: unreadCount artmış taze kopya.
    const fresh = conversation();
    fresh.recordInboundMessage({ messageId: 'in-99', body: 'bir de bu' });

    const { processor, getSavedConversation } = build({
      message,
      conversation: preSend,
      freshConversation: fresh,
    });

    await processor.process(job(message.id));

    // Gönderim öncesi kopya (unreadCount=0) geri yazılsaydı gelen mesaj kaybolurdu.
    expect(getSavedConversation()).toBe(fresh);
    expect(getSavedConversation()!.unreadCount).toBe(1);
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
    expect(messageCommandRepo.update).toHaveBeenCalled();
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
  it('klinik kotası dolu → gönderim YAPILMAZ, job ertelenir (deneme harcanmaz)', async () => {
    const message = queuedOutbound();
    const { processor, channel } = build({
      message,
      conversation: conversation(),
      sendQuota: { status: 'throttled', retryAfterMs: 250 },
    });
    const j = job(message.id);

    await expect(processor.process(j, 'tok')).rejects.toBeInstanceOf(
      DelayedError
    );

    expect(channel.send).not.toHaveBeenCalled();
    expect(message.status).toBe(MessageStatus.QUEUED);
    expect(j.moveToDelayed).toHaveBeenCalledTimes(1);
    // Erteleme anı, kotanın açılacağı ana güvenlik payı eklenerek kurulur.
    const [resumeAt, token] = (j.moveToDelayed as jest.Mock).mock.calls[0];
    expect(token).toBe('tok');
    expect(resumeAt).toBeGreaterThan(Date.now());
  });

  it('aynı yazışmada başka gönderim uçuşta → job ertelenir (sıra korunur)', async () => {
    const message = queuedOutbound();
    const { processor, channel, messagingCache } = build({
      message,
      conversation: conversation(),
      deliveryLock: { status: 'busy', retryAfterMs: 40 },
    });
    const j = job(message.id);

    await expect(processor.process(j, 'tok')).rejects.toBeInstanceOf(
      DelayedError
    );

    expect(channel.send).not.toHaveBeenCalled();
    expect(j.moveToDelayed).toHaveBeenCalledTimes(1);
    // Kilit alınamadı → serbest bırakacak bir şey yok (başkasının kilidi düşürülmez).
    expect(messagingCache.deliveryLock.release).not.toHaveBeenCalled();
  });

  it("kota reddinde de yazışma mutex'i serbest bırakılır", async () => {
    const message = queuedOutbound();
    const { processor, messagingCache } = build({
      message,
      conversation: conversation(),
      sendQuota: { status: 'throttled', retryAfterMs: 10 },
    });

    await expect(processor.process(job(message.id))).rejects.toBeInstanceOf(
      DelayedError
    );

    expect(messagingCache.deliveryLock.release).toHaveBeenCalledTimes(1);
  });

  it('gönderim hatasında da mutex serbest bırakılır (yazışma kilitli kalmaz)', async () => {
    const message = queuedOutbound();
    const { processor, messagingCache } = build({
      message,
      conversation: conversation(),
      sendImpl: jest.fn().mockRejectedValue(new Error('Meta 500')),
    });

    await expect(processor.process(job(message.id))).rejects.toThrow(
      'Meta 500'
    );

    expect(messagingCache.deliveryLock.release).toHaveBeenCalledTimes(1);
  });

  it('başarılı gönderimde mutex serbest bırakılır', async () => {
    const message = queuedOutbound();
    const { processor, messagingCache } = build({
      message,
      conversation: conversation(),
    });

    await processor.process(job(message.id));

    expect(messagingCache.deliveryLock.release).toHaveBeenCalledTimes(1);
  });
});
