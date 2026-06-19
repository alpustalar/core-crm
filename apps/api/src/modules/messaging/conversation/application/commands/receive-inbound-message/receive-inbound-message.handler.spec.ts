import { MessageDirection, MessageStatus } from '@prisma/client';
import { ReceiveInboundMessageHandler } from './receive-inbound-message.handler';
import { ReceiveInboundMessageCommand } from './receive-inbound-message.command';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { MessageReceivedEvent } from '@modules/messaging/conversation/domain/events/message-received.event';
import {
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

describe('ReceiveInboundMessageHandler (gelen mesaj çekirdeğe işlenir)', () => {
  const baseInput = {
    clinicId: 'clinic-1',
    organizationId: 'org-1',
    contactPhone: '+905550001122',
    contactName: 'Ada',
    externalId: 'wamid.in.1',
    body: 'merhaba',
  };

  const build = (params: {
    existingConversation?: Conversation | null;
    existingMessage?: Message | null;
    patient?: { id: string } | null;
  }) => {
    let savedConversation: Conversation | undefined;
    let savedMessage: Message | undefined;

    const conversationQueryRepo = {
      findByContact: jest
        .fn()
        .mockResolvedValue(params.existingConversation ?? null),
      findById: jest.fn(),
    } as unknown as IConversationQueryRepository;

    const conversationCommandRepo = {
      save: jest.fn(async (c: Conversation) => {
        savedConversation = c;
        return c;
      }),
    } as unknown as IConversationCommandRepository;

    const messageQueryRepo = {
      findByExternalId: jest.fn().mockResolvedValue(params.existingMessage ?? null),
      findManyByConversation: jest.fn(),
    } as unknown as IMessageQueryRepository;

    const messageCommandRepo = {
      save: jest.fn(async (m: Message) => {
        savedMessage = m;
        return m;
      }),
    } as unknown as IMessageCommandRepository;

    const queryBus = {
      execute: jest.fn().mockResolvedValue({ data: params.patient ?? null }),
    } as unknown as TSQueryBus;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as TransactionManager;

    const handler = new ReceiveInboundMessageHandler(
      conversationCommandRepo,
      conversationQueryRepo,
      messageCommandRepo,
      messageQueryRepo,
      queryBus,
      txManager
    );

    return {
      handler,
      queryBus,
      messageCommandRepo,
      conversationCommandRepo,
      getSavedConversation: () => savedConversation,
      getSavedMessage: () => savedMessage,
    };
  };

  it('yeni kontak: yeni Conversation + INBOUND mesaj + hasta eşleme + MessageReceivedEvent', async () => {
    const t = build({ existingConversation: null, patient: { id: 'patient-9' } });

    const id = await t.handler.execute(
      new ReceiveInboundMessageCommand(baseInput)
    );

    const message = t.getSavedMessage()!;
    const conversation = t.getSavedConversation()!;

    expect(id).toBe(message.id);
    expect(message.direction).toBe(MessageDirection.INBOUND);
    expect(message.status).toBe(MessageStatus.RECEIVED);
    expect(conversation.patientId).toBe('patient-9');
    expect(conversation.contactPhone).toBe(baseInput.contactPhone);

    const events = conversation.getDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(MessageReceivedEvent);
    expect((events[0] as MessageReceivedEvent).messageId).toBe(message.id);
  });

  it('var olan yazışma: hasta sorgusu yapılmaz, mevcut Conversation kullanılır', async () => {
    const existing = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: baseInput.contactPhone,
    });
    const t = build({ existingConversation: existing });

    await t.handler.execute(new ReceiveInboundMessageCommand(baseInput));

    expect(t.queryBus.execute).not.toHaveBeenCalled();
    expect(t.getSavedConversation()).toBe(existing);
  });

  it('idempotency: aynı externalId tekrar gelirse yeni mesaj oluşturulmaz', async () => {
    const already = Message.createInbound({
      conversationId: 'c-1',
      body: 'merhaba',
      externalId: baseInput.externalId,
    });
    const t = build({ existingMessage: already });

    const id = await t.handler.execute(
      new ReceiveInboundMessageCommand(baseInput)
    );

    expect(id).toBe(already.id);
    expect(t.messageCommandRepo.save).not.toHaveBeenCalled();
    expect(t.conversationCommandRepo.save).not.toHaveBeenCalled();
  });
});
