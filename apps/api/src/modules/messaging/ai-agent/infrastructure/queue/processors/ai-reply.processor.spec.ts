import { Job } from 'bullmq';
import { MESSAGING_AI_JOBS } from '@common/constants';
import { AiReplyProcessor } from './ai-reply.processor';
import { AiReplyJobData } from '../producers/ai-reply.producer';
import { IAiChatPort } from '@modules/messaging/ai-agent/domain/ports/ai-chat.port';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { IConversationQueryRepository } from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { SendMessageCommand } from '@modules/messaging/conversation/application/commands/send-message/send-message.command';
import { RequestConversationHandoffCommand } from '@modules/messaging/conversation/application/commands/request-conversation-handoff/request-conversation-handoff.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';

const DAY_MS = 24 * 60 * 60 * 1000;

interface BuildParams {
  conversation: Conversation | null;
  config?: {
    isEnabled: boolean;
    model: string;
    systemPrompt: string | null;
    maxTokens: number | null;
    replyOnlyWithinWindow: boolean;
    apiKey: string | null;
  } | null;
  messages?: Message[];
  reply?: { text: string | null; handoff: boolean; toolsUsed: string[] };
}

describe('AiReplyProcessor (AI otomatik yanıt worker)', () => {
  const defaultConfig = () => ({
    isEnabled: true,
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

    const conversationQueryRepo = {
      findById: jest.fn().mockResolvedValue(params.conversation),
    } as unknown as IConversationQueryRepository;

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

    const processor = new AiReplyProcessor(
      chatPort,
      conversationQueryRepo,
      messageQueryRepo,
      commandBus,
      queryBus
    );
    return { processor, chatPort, commandBus };
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
});
