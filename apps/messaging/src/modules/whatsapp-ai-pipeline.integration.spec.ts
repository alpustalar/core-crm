import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CqrsModule, QueryHandler } from '@nestjs/cqrs';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bullmq';
import { MessageDirection, MessageStatus } from '@shared';

import { QUEUES } from '@common/constants';
import { AI_MEMORY_WINDOW_SIZE } from '@messaging/constants/jobs.constant';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  TransactionContext,
  txStorage,
} from '@src/infrastructure/transaction/als-storage';

import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/conversation/domain/repositories/message.repository';
import { MESSAGE_CHANNEL_PORT } from '@modules/conversation/domain/ports/message-channel.port';
import {
  AI_CHAT_PORT,
  AiChatMessage,
} from '@modules/ai-agent/domain/ports/ai-chat.port';
import {
  IMessagingCacheService,
  MESSAGING_CACHE_SERVICE,
} from '@modules/conversation/domain/interfaces/messaging-cache.service.interface';
import {
  AI_MEMORY_CACHE_SERVICE,
  IAiMemoryCacheService,
} from '@modules/ai-agent/domain/interfaces/ai-memory-cache.service.interface';
import { CONTACT_RESOLVER_PORT } from '@modules/conversation/domain/ports/contact-resolver.port';

import { ReceiveInboundMessageCommand } from '@modules/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { ReceiveInboundMessageHandler } from '@modules/conversation/application/commands/receive-inbound-message/receive-inbound-message.handler';
import { SendMessageHandler } from '@modules/conversation/application/commands/send-message/send-message.handler';
import { RequestConversationHandoffHandler } from '@modules/conversation/application/commands/request-conversation-handoff/request-conversation-handoff.handler';
import { SendMessageProducer } from '@modules/conversation/infrastructure/queue/producers/send-message.producer';
import { MessageDeliveryProcessor } from '@modules/conversation/infrastructure/queue/processors/message-delivery.processor';
import { AiReplyProducer } from '@modules/ai-agent/infrastructure/queue/producers/ai-reply.producer';
import { AiReplyProcessor } from '@modules/ai-agent/infrastructure/queue/processors/ai-reply.processor';
import { AiReplyListener } from '@modules/ai-agent/infrastructure/events/listeners/ai-reply.listener';
import { GetAiAgentRuntimeConfigQuery } from '@modules/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.query';
import { AiAgentRuntimeConfig } from '@modules/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.response';

/**
 * UÇTAN UCA ENTEGRASYON TESTİ — WhatsApp inbound → AI yanıt turu → outbound teslim.
 *
 * Gerçek bileşenler zincirleme çalışır: ReceiveInboundMessageHandler →
 * MessageReceivedEvent (outboxRun) → AiReplyListener (@OnEvent) → MESSAGING_AI →
 * AiReplyProcessor → SendMessageCommand → SendMessageHandler → MESSAGING →
 * MessageDeliveryProcessor → kanal portu.
 *
 * DB/Redis olmadan çalışsın diye yalnız ŞU sınırlar taklit edilir:
 *  - MongoTransactionManager: gerçek ALS (txStorage) + gerçek EventEmitter2 ile event yayar
 *    (prod'daki outbox→relay hop'u test içinde doğrudan emit'e indirgenir).
 *  - BullMQ kuyrukları: `.add()` ilgili processor'ı satır içi (inline) çalıştırır.
 *  - Anthropic (IAiChatPort) ve Meta (MessageChannelPort): mock'lanır.
 *  - Repository'ler: durum tutan (stateful) in-memory store.
 */

const CLINIC_ID = 'clinic-1';
const ORG_ID = 'org-1';
const CONTACT_PHONE = '+905551112233';

// --- Test boyunca mutasyona uğrayan paylaşımlı durum -----------------------
let messageStore: Map<string, Message>;
let conversationStore: Map<string, Conversation>;
let aiConfig: AiAgentRuntimeConfig | null;
let aiReply: { text: string | null; handoff: boolean; toolsUsed: string[] };
let aiGenerate: jest.Mock;
let metaSend: jest.Mock;

/** Inbound'dan en yeni → en eski (createdAt desc) sıralı sayfa döndürür. */
const sortedDesc = (conversationId: string): Message[] =>
  [...messageStore.values()]
    .filter((m) => m.conversationId === conversationId)
    .reverse();

// --- Sahte query handler'lar (cross-cutting bağımlılıklar) ------------------
@QueryHandler(GetAiAgentRuntimeConfigQuery)
class FakeRuntimeConfigHandler {
  async execute() {
    return { data: aiConfig };
  }
}

/** Gerçek MongoTransactionManager'ın DB'siz ikizi: ALS context açar, sonunda event'leri yayar. */
class InMemoryTransactionManager {
  constructor(private readonly emitter: EventEmitter2) {}

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.exec(work);
  }

  outboxRun<T>(work: () => Promise<T>): Promise<T> {
    return this.exec(work);
  }

  private async exec<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing?.tx) return work();

    const context: TransactionContext = {
      tx: {} as never,
      events: [],
      correlationId: 'test-corr',
    };
    const result = await txStorage.run(context, work);
    for (const event of context.events) {
      await this.emitter.emitAsync(event.name, event.payload);
    }
    return result;
  }
}

/** İçeri eklenen job'u ilgili processor'da satır içi çalıştıran sahte kuyruk. */
const inlineQueue = (processor: {
  process: (job: unknown) => Promise<void>;
}) => ({
  add: async (name: string, data: unknown) => {
    await processor.process({ name, data, attemptsMade: 0 });
  },
});

/**
 * Redis yerine süreç-içi messaging cache'i. Dedup kilidi gerçek semantiğiyle taklit
 * edilir (kazanan tutar, başarısızlıkta bırakılır) — pipeline'ın mükerrer webhook
 * davranışı böylece gerçekten sınanır.
 */
const inMemoryMessagingCache = (): IMessagingCacheService => {
  const inboundLocks = new Map<string, string>();
  const deliveryLocks = new Map<string, string>();

  return {
    inboundDedupTtlSeconds: 900,
    deliveryLockTtlSeconds: 60,
    inboundDedup: {
      acquire: async ({ channel, externalId, holderId }) => {
        const key = `${channel}:${externalId}`;
        if (inboundLocks.has(key)) return { status: 'duplicate' };
        inboundLocks.set(key, holderId);
        return { status: 'acquired' };
      },
      release: async ({ channel, externalId, holderId }) => {
        const key = `${channel}:${externalId}`;
        if (inboundLocks.get(key) === holderId) inboundLocks.delete(key);
      },
    },
    sendQuota: { consume: async () => ({ status: 'allowed' }) },
    deliveryLock: {
      acquire: async ({ conversationId, holderId }) => {
        if (deliveryLocks.has(conversationId)) {
          return { status: 'busy', retryAfterMs: 10 };
        }
        deliveryLocks.set(conversationId, holderId);
        return { status: 'acquired' };
      },
      release: async ({ conversationId, holderId }) => {
        if (deliveryLocks.get(conversationId) === holderId) {
          deliveryLocks.delete(conversationId);
        }
      },
    },
  };
};

/**
 * Redis yerine süreç-içi AI bağlam penceresi. `append`'in soğuk pencerede no-op olması
 * (kısmi geçmiş üretmeme kuralı) Lua tarafıyla birebir aynı tutulur.
 */
const inMemoryAiMemoryCache = (): IAiMemoryCacheService => {
  const windows = new Map<string, AiChatMessage[]>();

  return {
    windowSize: AI_MEMORY_WINDOW_SIZE,
    read: async (conversationId) => windows.get(conversationId) ?? null,
    warm: async ({ conversationId, history }) => {
      windows.set(conversationId, history.slice(-AI_MEMORY_WINDOW_SIZE));
    },
    append: async ({ conversationId, message }) => {
      const window = windows.get(conversationId);
      if (!window) return;
      windows.set(
        conversationId,
        [...window, message].slice(-AI_MEMORY_WINDOW_SIZE)
      );
    },
    clear: async (conversationId) => {
      windows.delete(conversationId);
    },
  };
};

/** Olay→kuyruk zinciri async olduğundan, beklenen etki gerçekleşene dek kısa aralıkla yoklar. */
const waitFor = async (
  condition: () => boolean,
  timeoutMs = 1000
): Promise<void> => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor: beklenen koşul zaman aşımına uğradı');
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

const buildApp = async (): Promise<INestApplication> => {
  const findMessageByExternalId = async (externalId: string) =>
    [...messageStore.values()].find((m) => m.externalId === externalId) ?? null;
  const findConversationByContact = async (props: {
    clinicId: string;
    contactPhone: string;
  }) =>
    [...conversationStore.values()].find(
      (c) =>
        c.clinicId === props.clinicId && c.contactPhone === props.contactPhone
    ) ?? null;

  // Not: bellek içi taklitte kilit yok; *ForUpdate metodları kilitsiz karşılıklarına
  // eşlenir — burada doğrulanan şey kilit değil, uçtan uca akış.
  const messageCommandRepo = {
    findById: async (id: string) => messageStore.get(id) ?? null,
    findByIdForUpdate: async (id: string) => messageStore.get(id) ?? null,
    findByExternalId: findMessageByExternalId,
    findByExternalIdForUpdate: findMessageByExternalId,
    create: async (m: Message) => {
      messageStore.set(m.id, m);
      m.flushEvents();
      return m;
    },
    update: async (m: Message) => {
      messageStore.set(m.id, m);
      m.flushEvents();
      return m;
    },
  };
  const messageQueryRepo = {
    findById: async (id: string) => messageStore.get(id) ?? null,
    findManyByConversation: async (conversationId: string) => {
      const items = sortedDesc(conversationId);
      return { items, total: items.length };
    },
  };
  const conversationCommandRepo = {
    findById: async (id: string) => conversationStore.get(id) ?? null,
    findByIdForUpdate: async (id: string) => conversationStore.get(id) ?? null,
    findByContactForUpdate: findConversationByContact,
    create: async (c: Conversation) => {
      conversationStore.set(c.id, c);
      c.flushEvents();
      return c;
    },
    update: async (c: Conversation) => {
      conversationStore.set(c.id, c);
      c.flushEvents();
      return c;
    },
  };
  const conversationQueryRepo = {
    findById: async (id: string) => conversationStore.get(id) ?? null,
    findByContact: findConversationByContact,
  };

  const chatPort = { generateReply: aiGenerate };
  const channelPort = { send: metaSend, markRead: jest.fn() };

  const moduleRef = await Test.createTestingModule({
    imports: [CqrsModule, EventEmitterModule.forRoot()],
    providers: [
      // Gerçek pipeline bileşenleri
      ReceiveInboundMessageHandler,
      SendMessageHandler,
      RequestConversationHandoffHandler,
      AiReplyListener,
      AiReplyProducer,
      SendMessageProducer,
      AiReplyProcessor,
      MessageDeliveryProcessor,
      TSCommandBus,
      TSQueryBus,
      FakeRuntimeConfigHandler,
      // Sınır taklitleri
      { provide: AI_CHAT_PORT, useValue: chatPort },
      // Kontak sınırı port seviyesinde taklit edilir. Gerçekte NATS ile core'a gider;
      // bu testin konusu boru hattı, kontak çözümlemesinin taşıması değil. Misafir
      // (eşleşme yok) senaryosu kurulur.
      {
        provide: CONTACT_RESOLVER_PORT,
        useValue: {
          findPatientId: jest.fn(async () => null),
          registerAdReferralLead: jest.fn(async () => null),
        },
      },
      { provide: MESSAGING_CACHE_SERVICE, useValue: inMemoryMessagingCache() },
      { provide: AI_MEMORY_CACHE_SERVICE, useValue: inMemoryAiMemoryCache() },
      { provide: MESSAGE_CHANNEL_PORT, useValue: channelPort },
      { provide: MESSAGE_COMMAND_REPOSITORY, useValue: messageCommandRepo },
      { provide: MESSAGE_QUERY_REPOSITORY, useValue: messageQueryRepo },
      {
        provide: CONVERSATION_COMMAND_REPOSITORY,
        useValue: conversationCommandRepo,
      },
      {
        provide: CONVERSATION_QUERY_REPOSITORY,
        useValue: conversationQueryRepo,
      },
      {
        provide: MongoTransactionManager,
        useFactory: (emitter: EventEmitter2) =>
          new InMemoryTransactionManager(emitter),
        inject: [EventEmitter2],
      },
      {
        provide: getQueueToken(QUEUES.MESSAGING_AI),
        useFactory: (p: AiReplyProcessor) => inlineQueue(p),
        inject: [AiReplyProcessor],
      },
      {
        provide: getQueueToken(QUEUES.MESSAGING),
        useFactory: (p: MessageDeliveryProcessor) => inlineQueue(p),
        inject: [MessageDeliveryProcessor],
      },
    ],
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  return app;
};

const inbound = (body: string, externalId = 'wamid.IN-1') =>
  new ReceiveInboundMessageCommand({
    clinicId: CLINIC_ID,
    organizationId: ORG_ID,
    contactPhone: CONTACT_PHONE,
    contactName: 'Test Hasta',
    externalId,
    body,
  });

describe('WhatsApp AI pipeline (inbound → AI → outbound) [integration]', () => {
  let app: INestApplication;
  let commandBus: TSCommandBus;

  beforeEach(async () => {
    messageStore = new Map();
    conversationStore = new Map();
    aiConfig = {
      isEnabled: true,
      provider: 'ANTHROPIC',
      model: 'claude-haiku-4-5',
      systemPrompt: null,
      maxTokens: null,
      replyOnlyWithinWindow: true,
      apiKey: 'sk-test',
    };
    aiReply = {
      text: 'Merhaba! Size nasıl yardımcı olabilirim?',
      handoff: false,
      toolsUsed: [],
    };
    aiGenerate = jest.fn(async () => aiReply);
    metaSend = jest.fn(async () => ({ externalId: 'wamid.OUT-1' }));

    app = await buildApp();
    commandBus = app.get(TSCommandBus);
  });

  afterEach(async () => {
    await app?.close();
    jest.clearAllMocks();
  });

  it('gelen mesaj AI yanıtını üretir ve outbound olarak Meta kanalına teslim eder', async () => {
    await commandBus.execute(inbound('Merhaba, randevu almak istiyorum'));
    // Olay→AI kuyruğu→gönderim kuyruğu zinciri async; outbound teslim edilene dek bekle.
    await waitFor(() => metaSend.mock.calls.length > 0);

    // AI turu çalıştı
    expect(aiGenerate).toHaveBeenCalledTimes(1);
    const aiArg = aiGenerate.mock.calls[0][0];
    expect(aiArg).toMatchObject({
      clinicId: CLINIC_ID,
      model: 'claude-haiku-4-5',
      apiKey: 'sk-test',
    });
    // Geçmiş kronolojik ve son inbound metnini içeriyor
    expect(aiArg.history[aiArg.history.length - 1]).toEqual({
      role: 'user',
      content: 'Merhaba, randevu almak istiyorum',
    });

    // AI metni Meta kanalına gönderildi
    expect(metaSend).toHaveBeenCalledTimes(1);
    expect(metaSend).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: CLINIC_ID,
        toPhone: CONTACT_PHONE,
        body: 'Merhaba! Size nasıl yardımcı olabilirim?',
      })
    );

    // Outbound mesaj SENT olarak işaretlendi (externalId atandı)
    const outbound = [...messageStore.values()].find(
      (m) => m.direction === MessageDirection.OUTBOUND
    );
    expect(outbound).toBeDefined();
    expect(outbound!.status).toBe(MessageStatus.SENT);
    expect(outbound!.externalId).toBe('wamid.OUT-1');
  });

  it('AI config pasifse yanıt üretilmez ve Meta kanalına hiçbir şey gönderilmez', async () => {
    aiConfig = { ...aiConfig!, isEnabled: false };

    await commandBus.execute(inbound('Merhaba'));
    // Listener async; pasif config'te kuyruğa hiç düşmediğini doğrulamak için kısa bekleme.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(aiGenerate).not.toHaveBeenCalled();
    expect(metaSend).not.toHaveBeenCalled();
    // Yalnız inbound mesaj var, outbound yok
    const outbound = [...messageStore.values()].filter(
      (m) => m.direction === MessageDirection.OUTBOUND
    );
    expect(outbound).toHaveLength(0);
  });

  it('AI insana devir isterse outbound gönderilmez ve yazışma AI için uygunsuz hale gelir', async () => {
    aiReply = { text: null, handoff: true, toolsUsed: ['handoff_to_human'] };

    await commandBus.execute(inbound('Yetkiliye bağlanmak istiyorum'));
    // Devir komutu işlenip yazışma PENDING'e geçene dek bekle.
    await waitFor(() => {
      const c = [...conversationStore.values()][0];
      return !!c && !c.isEligibleForAiReply();
    });

    expect(aiGenerate).toHaveBeenCalledTimes(1);
    expect(metaSend).not.toHaveBeenCalled();
  });
  it('mükerrer webhook teslimi: aynı wamid iki kez gelirse tek mesaj + tek AI yanıtı', async () => {
    // Meta aynı webhook'u tekrar iletebiliyor. İkinci teslim dedup kilidine takılıp
    // çekilmeli: ne ikinci bir INBOUND kayıt, ne de ikinci bir AI turu oluşmalı.
    await commandBus.execute(inbound('Merhaba', 'wamid.DUP-1'));
    await waitFor(() => metaSend.mock.calls.length > 0);

    await commandBus.execute(inbound('Merhaba', 'wamid.DUP-1'));

    const inboundMessages = [...messageStore.values()].filter(
      (m) => m.direction === MessageDirection.INBOUND
    );
    expect(inboundMessages).toHaveLength(1);
    expect(aiGenerate).toHaveBeenCalledTimes(1);
    expect(metaSend).toHaveBeenCalledTimes(1);
  });

  it('AI bağlam penceresi cache üzerinden büyür: ikinci tur DB okuması yapmadan geçmişi taşır', async () => {
    await commandBus.execute(inbound('Merhaba', 'wamid.IN-A'));
    await waitFor(() => metaSend.mock.calls.length > 0);

    await commandBus.execute(inbound('Randevu almak istiyorum', 'wamid.IN-B'));
    await waitFor(() => metaSend.mock.calls.length > 1);

    // İkinci AI turu: ilk soru + AI yanıtı + yeni soru penceredeki sırayla görülmeli.
    const secondTurn = aiGenerate.mock.calls[1][0];
    expect(secondTurn.history).toEqual([
      { role: 'user', content: 'Merhaba' },
      {
        role: 'assistant',
        content: 'Merhaba! Size nasıl yardımcı olabilirim?',
      },
      { role: 'user', content: 'Randevu almak istiyorum' },
    ]);
  });
});
