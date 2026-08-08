import { Job } from 'bullmq';
import { MESSAGING_AI_JOBS } from '@common/constants';
import { AiReplyProcessor } from './ai-reply.processor';
import { AiReplyJobData } from '../producers/ai-reply.producer';
import { IAiChatPort } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { IConversationCommandRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { SendMessageCommand } from '@modules/messaging/conversation/application/commands/send-message/send-message.command';
import { RequestConversationHandoffCommand } from '@modules/messaging/conversation/application/commands/request-conversation-handoff/request-conversation-handoff.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { AI_MEMORY_WINDOW_SIZE } from '@common/constants';
import { AiChatMessage } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { IAiMemoryCacheService } from '@modules/messaging/ai-agent/domain/interfaces/ai-memory-cache.service.interface';

const DAY_MS = 24 * 60 * 60 * 1000;

interface BuildParams {
  conversation: Conversation | null;
  config?: {
    isEnabled: boolean;
    provider: 'ANTHROPIC' | 'GEMINI';
    model: string;
    systemPrompt: string | null;
    maxTokens: number | null;
    replyOnlyWithinWindow: boolean;
    apiKey: string | null;
  } | null;
  messages?: Message[];
  /** Verilirse pencere SICAK sayılır ve DB okuması yapılmaz. */
  cachedHistory?: AiChatMessage[];
  reply?: { text: string | null; handoff: boolean; toolsUsed: string[] };
}

describe('AiReplyProcessor (AI otomatik yanıt worker)', () => {
  const defaultConfig = () => ({
    isEnabled: true,
    provider: 'ANTHROPIC' as const,
    model: 'claude-haiku-4-5',
    systemPrompt: null,
    maxTokens: null,
    replyOnlyWithinWindow: true,
    apiKey: 'sk-test',
  });

  const build = (params: BuildParams) => {
    const generateReply = jest
      .fn()
      .mockResolvedValue(
        params.reply ?? { text: 'cevap', handoff: false, toolsUsed: [] }
      );
    const chatPort = { generateReply } as unknown as IAiChatPort;

    const conversationCommandRepo = {
      findById: jest.fn().mockResolvedValue(params.conversation),
    } as unknown as IConversationCommandRepository;

    const messageQueryRepo = {
      findManyByConversation: jest
        .fn()
        .mockResolvedValue({ items: params.messages ?? [], total: 0 }),
    } as unknown as IMessageQueryRepository;

    const commandBus = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as TSCommandBus;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({
        data: params.config === undefined ? defaultConfig() : params.config,
      }),
    } as unknown as TSQueryBus;

    // Varsayılan: pencere soğuk (read → null) → geçmiş DB'den yüklenip ısıtılır.
    const aiMemoryCache = {
      windowSize: AI_MEMORY_WINDOW_SIZE,
      read: jest.fn().mockResolvedValue(params.cachedHistory ?? null),
      warm: jest.fn().mockResolvedValue(undefined),
      append: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    } as unknown as IAiMemoryCacheService;

    const processor = new AiReplyProcessor(
      chatPort,
      conversationCommandRepo,
      messageQueryRepo,
      aiMemoryCache,
      commandBus,
      queryBus
    );
    return { processor, chatPort, commandBus, aiMemoryCache, messageQueryRepo };
  };

  const job = (data: AiReplyJobData): Job<AiReplyJobData> =>
    ({ name: MESSAGING_AI_JOBS.GENERATE_REPLY, data }) as Job<AiReplyJobData>;

  /** OPEN yazışma + açık servis penceresi (az önce inbound) + bir inbound metin mesajı. */
  const openConversation = () => {
    const c = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    c.recordInboundMessage({ messageId: 'm-1', body: 'merhaba' });
    return c;
  };

  const inboundMsg = () =>
    Message.createInbound({ conversationId: 'conv-1', body: 'merhaba' });

  const data: AiReplyJobData = {
    conversationId: 'conv-1',
    messageId: 'm-1',
  };

  it('happy path: yanıt üretilir → SendMessageCommand dispatch edilir', async () => {
    const { processor, chatPort, commandBus } = build({
      conversation: openConversation(),
      messages: [inboundMsg()],
    });

    await processor.process(job(data));

    expect(chatPort.generateReply).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(SendMessageCommand)
    );
  });

  it('handoff: AI insana devir isterse RequestConversationHandoffCommand dispatch edilir', async () => {
    const { processor, commandBus } = build({
      conversation: openConversation(),
      messages: [inboundMsg()],
      reply: { text: null, handoff: true, toolsUsed: ['handoff_to_human'] },
    });

    await processor.process(job(data));

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(RequestConversationHandoffCommand)
    );
  });

  it('config yok → atla (yanıt üretilmez)', async () => {
    const { processor, chatPort, commandBus } = build({
      conversation: openConversation(),
      config: null,
      messages: [inboundMsg()],
    });

    await processor.process(job(data));

    expect(chatPort.generateReply).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('config disabled → atla', async () => {
    const { processor, chatPort } = build({
      conversation: openConversation(),
      config: { ...defaultConfig(), isEnabled: false },
      messages: [inboundMsg()],
    });

    await processor.process(job(data));
    expect(chatPort.generateReply).not.toHaveBeenCalled();
  });

  it('yazışma bir kullanıcıya atanmış (insan devraldı) → atla', async () => {
    const conversation = openConversation();
    conversation.assign('user-9'); // OPEN → PENDING + assignedUserId

    const { processor, chatPort } = build({
      conversation,
      messages: [inboundMsg()],
    });

    await processor.process(job(data));
    expect(chatPort.generateReply).not.toHaveBeenCalled();
  });

  it('pazarlama opt-out → atla', async () => {
    const conversation = openConversation();
    conversation.optOutMarketing();

    const { processor, chatPort } = build({
      conversation,
      messages: [inboundMsg()],
    });

    await processor.process(job(data));
    expect(chatPort.generateReply).not.toHaveBeenCalled();
  });

  it('servis penceresi kapalı + replyOnlyWithinWindow → atla', async () => {
    const conversation = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: '+905550001122',
    });
    // 25 saat önce inbound → pencere kapalı
    conversation.recordInboundMessage({
      messageId: 'old',
      body: 'eski',
      occurredAt: new Date(Date.now() - 25 * (DAY_MS / 24)),
    });

    const { processor, chatPort } = build({
      conversation,
      messages: [inboundMsg()],
    });

    await processor.process(job(data));
    expect(chatPort.generateReply).not.toHaveBeenCalled();
  });

  it('yazışma bulunamadı → güvenli şekilde atla', async () => {
    const { processor, chatPort } = build({
      conversation: null,
      messages: [],
    });

    await processor.process(job(data));
    expect(chatPort.generateReply).not.toHaveBeenCalled();
  });
  it("pencere SICAK: geçmiş Redis'ten okunur, mesaj tablosuna gidilmez", async () => {
    const { processor, chatPort, messageQueryRepo, aiMemoryCache } = build({
      conversation: openConversation(),
      cachedHistory: [{ role: 'user', content: 'merhaba' }],
    });

    await processor.process(job(data));

    expect(messageQueryRepo.findManyByConversation).not.toHaveBeenCalled();
    expect(aiMemoryCache.warm).not.toHaveBeenCalled();
    expect(chatPort.generateReply).toHaveBeenCalledWith(
      expect.objectContaining({
        history: [{ role: 'user', content: 'merhaba' }],
      })
    );
  });

  it("pencere SOĞUK: DB'den yüklenir ve cache ısıtılır", async () => {
    const { processor, messageQueryRepo, aiMemoryCache } = build({
      conversation: openConversation(),
      messages: [inboundMsg()],
    });

    await processor.process(job(data));

    expect(messageQueryRepo.findManyByConversation).toHaveBeenCalledTimes(1);
    expect(aiMemoryCache.warm).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      history: [{ role: 'user', content: 'merhaba' }],
    });
  });

  it('pencere boyutu aşılırsa son N tur alınır ve ilk tur user olur', async () => {
    // 2N tur: user/assistant dönüşümlü. Kırpma sonrası baştaki assistant atılmalı.
    const long: AiChatMessage[] = Array.from(
      { length: AI_MEMORY_WINDOW_SIZE * 2 },
      (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `t${i}`,
      })
    );
    const { processor, chatPort } = build({
      conversation: openConversation(),
      cachedHistory: long,
    });

    await processor.process(job(data));

    const { history } = (chatPort.generateReply as jest.Mock).mock.calls[0][0];
    expect(history).toHaveLength(AI_MEMORY_WINDOW_SIZE);
    expect(history[0].role).toBe('user');
    expect(history[history.length - 1].content).toBe(
      `t${AI_MEMORY_WINDOW_SIZE * 2 - 1}`
    );
  });

  it('cache ardışık aynı-rol tur taşırsa birleştirilir (Anthropic kuralı)', async () => {
    const { processor, chatPort } = build({
      conversation: openConversation(),
      cachedHistory: [
        { role: 'user', content: 'merhaba' },
        { role: 'user', content: 'randevu almak istiyorum' },
      ],
    });

    await processor.process(job(data));

    expect(chatPort.generateReply).toHaveBeenCalledWith(
      expect.objectContaining({
        history: [
          { role: 'user', content: 'merhaba\nrandevu almak istiyorum' },
        ],
      })
    );
  });
});
