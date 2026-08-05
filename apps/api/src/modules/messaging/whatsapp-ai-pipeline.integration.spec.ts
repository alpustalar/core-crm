import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CqrsModule, QueryHandler } from '@nestjs/cqrs';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bullmq';
import { MessageDirection, MessageStatus } from '@prisma/client';

import { QUEUES } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  TransactionContext,
  txStorage,
} from '@src/infrastructure/persistence/prisma/transaction/als-storage';

import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { MESSAGE_CHANNEL_PORT } from '@modules/messaging/conversation/domain/ports/message-channel.port';
import { AI_CHAT_PORT } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';

import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { ReceiveInboundMessageHandler } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.handler';
import { SendMessageHandler } from '@modules/messaging/conversation/application/commands/send-message/send-message.handler';
import { RequestConversationHandoffHandler } from '@modules/messaging/conversation/application/commands/request-conversation-handoff/request-conversation-handoff.handler';
import { SendMessageProducer } from '@modules/messaging/conversation/infrastructure/queue/producers/send-message.producer';
import { MessageDeliveryProcessor } from '@modules/messaging/conversation/infrastructure/queue/processors/message-delivery.processor';
import { AiReplyProducer } from '@modules/messaging/ai-agent/infrastructure/queue/producers/ai-reply.producer';
import { AiReplyProcessor } from '@modules/messaging/ai-agent/infrastructure/queue/processors/ai-reply.processor';
import { AiReplyListener } from '@modules/messaging/ai-agent/infrastructure/events/listeners/ai-reply.listener';
import { GetAiAgentRuntimeConfigQuery } from '@modules/messaging/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.query';
import { AiAgentRuntimeConfig } from '@modules/messaging/ai-agent/application/queries/get-ai-agent-runtime-config/get-ai-agent-runtime-config.response';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';

/**
 * UÇTAN UCA ENTEGRASYON TESTİ — WhatsApp inbound → AI yanıt turu → outbound teslim.
 *
 * Gerçek bileşenler zincirleme çalışır: ReceiveInboundMessageHandler →
 * MessageReceivedEvent (outboxRun) → AiReplyListener (@OnEvent) → MESSAGING_AI →
 * AiReplyProcessor → SendMessageCommand → SendMessageHandler → MESSAGING →
 * MessageDeliveryProcessor → kanal portu.
 *
 * DB/Redis olmadan çalışsın diye yalnız ŞU sınırlar taklit edilir:
 *  - TransactionManager: gerçek ALS (txStorage) + gerçek EventEmitter2 ile event yayar
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

@QueryHandler(FindPatientByContactQuery)
class FakePatientHandler {
  async execute() {
    return { data: null };
  }
}

/** Gerçek TransactionManager'ın DB'siz ikizi: ALS context açar, sonunda event'leri yayar. */
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
  const messageCommandRepo = {
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
    findByExternalId: async (externalId: string) =>
      [...messageStore.values()].find((m) => m.externalId === externalId) ??
      null,
    findManyByConversation: async (conversationId: string) => {
      const items = sortedDesc(conversationId);
      return { items, total: items.length };
    },
  };
  const conversationCommandRepo = {
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
    findByContact: async (props: { clinicId: string; contactPhone: string }) =>
      [...conversationStore.values()].find(
        (c) =>
          c.clinicId === props.clinicId && c.contactPhone === props.contactPhone
      ) ?? null,
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
      FakePatientHandler,
      // Sınır taklitleri
      { provide: AI_CHAT_PORT, useValue: chatPort },
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
        provide: TransactionManager,
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
});
