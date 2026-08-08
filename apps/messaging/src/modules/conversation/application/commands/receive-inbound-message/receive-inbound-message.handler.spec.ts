import { MessageChannel, MessageDirection, MessageStatus } from '@shared';
import { ReceiveInboundMessageHandler } from './receive-inbound-message.handler';
import { ReceiveInboundMessageCommand } from './receive-inbound-message.command';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { MessageReceivedEvent } from '@modules/conversation/domain/events/message-received.event';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { IMessageCommandRepository } from '@modules/conversation/domain/repositories/message.repository';
import { IContactResolverPort } from '@modules/conversation/domain/ports/contact-resolver.port';
import { MongoTransactionManager } from '@src/infrastructure/persistence/mongo/mongo-transaction.manager';
import {
  InboundLockResult,
  IMessagingCacheService,
} from '@modules/conversation/domain/interfaces/messaging-cache.service.interface';
import { IAiMemoryCacheService } from '@modules/ai-agent/domain/interfaces/ai-memory-cache.service.interface';

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
    inboundLock?: InboundLockResult;
  }) => {
    let savedConversation: Conversation | undefined;
    let savedMessage: Message | undefined;

    // Yazışma okuması kilitli ve command repo'dan: `recordInboundMessage`
    // unreadCount'u okuyup artırıyor, eşzamanlı iki mesaj birbirini ezmemeli.
    const conversationCommandRepo = {
      findByContactForUpdate: jest
        .fn()
        .mockResolvedValue(params.existingConversation ?? null),
      findById: jest.fn(),
      findByIdForUpdate: jest.fn(),
      create: jest.fn(async (c: Conversation) => {
        savedConversation = c;
        return c;
      }),
      update: jest.fn(async (c: Conversation) => {
        savedConversation = c;
        return c;
      }),
    } as unknown as IConversationCommandRepository;

    const messageCommandRepo = {
      findByExternalId: jest
        .fn()
        .mockResolvedValue(params.existingMessage ?? null),
      create: jest.fn(async (m: Message) => {
        savedMessage = m;
        return m;
      }),
      update: jest.fn(async (m: Message) => {
        savedMessage = m;
        return m;
      }),
    } as unknown as IMessageCommandRepository;

    // Kontak çözümü artık port'un ardında; kanal-farkındalı telefon seçimi ve
    // best-effort hata yutma adapter'ın sorumluluğu (kendi spec'inde sınanır).
    const contactResolver = {
      findPatientId: jest.fn().mockResolvedValue(params.patient?.id ?? null),
      registerAdReferralLead: jest.fn().mockResolvedValue('lead-generated-1'),
    } as unknown as IContactResolverPort;

    const txManager = {
      outboxRun: jest.fn((cb: () => Promise<unknown>) => cb()),
    } as unknown as MongoTransactionManager;

    // Varsayılan: kilit alınır (mükerrer değil). Dedup senaryosu bunu override eder.
    const messagingCache = {
      inboundDedup: {
        acquire: jest
          .fn()
          .mockResolvedValue(params.inboundLock ?? { status: 'acquired' }),
        release: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as IMessagingCacheService;

    const aiMemoryCache = {
      append: jest.fn().mockResolvedValue(undefined),
    } as unknown as IAiMemoryCacheService;

    const handler = new ReceiveInboundMessageHandler(
      conversationCommandRepo,
      messageCommandRepo,
      messagingCache,
      aiMemoryCache,
      contactResolver,
      txManager
    );

    return {
      handler,
      contactResolver,
      messagingCache,
      aiMemoryCache,
      messageCommandRepo,
      conversationCommandRepo,
      getSavedConversation: () => savedConversation,
      getSavedMessage: () => savedMessage,
    };
  };

  it('yeni kontak: yeni Conversation + INBOUND mesaj + hasta eşleme + MessageReceivedEvent', async () => {
    const t = build({
      existingConversation: null,
      patient: { id: 'patient-9' },
    });

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

  it('var olan yazışma: hasta sorgusu yapılır, mevcut Conversation kullanılır', async () => {
    const existing = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: baseInput.contactPhone,
    });
    const t = build({ existingConversation: existing });

    await t.handler.execute(new ReceiveInboundMessageCommand(baseInput));

    // Hasta eşlemesi her gelen mesajda çözülür (AI/CRM bağlamı için).
    expect(t.contactResolver.findPatientId).toHaveBeenCalledTimes(1);
    expect(t.getSavedConversation()).toBe(existing);
  });

  it("Telegram: kanal ve matchPhone port'a olduğu gibi geçirilir", async () => {
    // Telefon seçimi (chatId mi matchPhone mu) adapter'ın kararı; handler yalnız
    // ham kontak bilgisini eksiksiz aktarmakla yükümlü.
    const t = build({ existingConversation: null, patient: null });

    await t.handler.execute(
      new ReceiveInboundMessageCommand({
        ...baseInput,
        channel: MessageChannel.TELEGRAM,
        contactPhone: '987654321', // chatId — telefon değil
        matchPhone: '905550001122',
      })
    );

    expect(t.contactResolver.findPatientId).toHaveBeenCalledWith({
      clinicId: baseInput.clinicId,
      channel: MessageChannel.TELEGRAM,
      contactPhone: '987654321',
      matchPhone: '905550001122',
    });
    expect(t.getSavedConversation()!.patientId).toBeNull();
  });

  it('Telegram contact paylaşımı (matchPhone): var olan misafir konuşma hastaya bağlanır', async () => {
    const existing = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      channel: MessageChannel.TELEGRAM,
      contactPhone: '987654321',
    });
    const t = build({ existingConversation: existing, patient: { id: 'p-7' } });

    await t.handler.execute(
      new ReceiveInboundMessageCommand({
        ...baseInput,
        channel: MessageChannel.TELEGRAM,
        contactPhone: '987654321',
        matchPhone: '905550001122',
        externalId: 'tg:987654321:5',
      })
    );

    expect(t.contactResolver.findPatientId).toHaveBeenCalledTimes(1);
    expect(t.getSavedConversation()!.patientId).toBe('p-7');
  });

  const adReferral = {
    medium: 'AD' as const,
    adId: 'ad-123',
    sourceUrl: 'https://fb.me/x',
    ctwaClid: 'ctwa-xyz',
    headline: 'Saç Ekimi',
    body: null,
  };

  it("reklam referral (WhatsApp): yeni misafir yazışmada attribution'lı Lead üretilir ve bağlanır", async () => {
    const t = build({ existingConversation: null, patient: null });

    await t.handler.execute(
      new ReceiveInboundMessageCommand({ ...baseInput, referral: adReferral })
    );

    // Attribution port'a eksiksiz geçirildi (lead sözleşmesine çevrim adapter'da).
    expect(t.contactResolver.registerAdReferralLead).toHaveBeenCalledWith({
      clinicId: baseInput.clinicId,
      organizationId: baseInput.organizationId,
      channel: MessageChannel.WHATSAPP,
      contactPhone: baseInput.contactPhone,
      contactName: baseInput.contactName,
      referral: {
        adId: 'ad-123',
        ctwaClid: 'ctwa-xyz',
        sourceUrl: 'https://fb.me/x',
      },
    });

    // Dönen leadId yazışmaya bağlandı.
    expect(t.getSavedConversation()!.leadId).toBe('lead-generated-1');
  });

  it('reklam referral ama hasta zaten kayıtlı: Lead üretilmez (misafir değil)', async () => {
    const t = build({
      existingConversation: null,
      patient: { id: 'patient-9' },
    });

    await t.handler.execute(
      new ReceiveInboundMessageCommand({ ...baseInput, referral: adReferral })
    );

    expect(t.contactResolver.registerAdReferralLead).not.toHaveBeenCalled();
    expect(t.getSavedConversation()!.leadId).toBeNull();
  });

  it('referral yok: Lead üretilmez', async () => {
    const t = build({ existingConversation: null, patient: null });

    await t.handler.execute(new ReceiveInboundMessageCommand(baseInput));

    expect(t.contactResolver.registerAdReferralLead).not.toHaveBeenCalled();
  });

  it('reklam referral ama var olan yazışma: Lead üretilmez (yalnız yeni yazışmada)', async () => {
    const existing = Conversation.start({
      clinicId: 'clinic-1',
      organizationId: 'org-1',
      contactPhone: baseInput.contactPhone,
    });
    const t = build({ existingConversation: existing, patient: null });

    await t.handler.execute(
      new ReceiveInboundMessageCommand({ ...baseInput, referral: adReferral })
    );

    expect(t.contactResolver.registerAdReferralLead).not.toHaveBeenCalled();
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
    expect(t.messageCommandRepo.update).not.toHaveBeenCalled();
    expect(t.conversationCommandRepo.update).not.toHaveBeenCalled();
  });
  it('eşzamanlı mükerrer teslim: dedup kilidi alınamazsa hiçbir yazma yapılmaz', async () => {
    // Ön-kontrol (findByExternalId) yalnız SIRAYLA gelen tekrarı eler; paralel teslimde
    // iki istek de kontrolü geçer. İkinci istek kilide takılıp çekilmelidir.
    const t = build({ inboundLock: { status: 'duplicate' } });

    const id = await t.handler.execute(
      new ReceiveInboundMessageCommand(baseInput)
    );

    expect(id).toBe('');
    expect(t.messageCommandRepo.create).not.toHaveBeenCalled();
    expect(t.conversationCommandRepo.create).not.toHaveBeenCalled();
    expect(t.aiMemoryCache.append).not.toHaveBeenCalled();
  });

  it('mükerrer teslimde kazanan commit etmişse gerçek mesaj id dönülür', async () => {
    const winner = Message.createInbound({
      conversationId: 'c-1',
      body: 'merhaba',
      externalId: baseInput.externalId,
    });
    const t = build({ inboundLock: { status: 'duplicate' } });
    // İlk çağrı (ön-kontrol) boş, kilit sonrası ikinci çağrı kazananı bulur.
    (t.messageCommandRepo.findByExternalId as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(winner);

    const id = await t.handler.execute(
      new ReceiveInboundMessageCommand(baseInput)
    );

    expect(id).toBe(winner.id);
  });

  it('işleme patlarsa kilit bırakılır (Meta yeniden teslimi işlenebilsin)', async () => {
    const t = build({});
    (t.messageCommandRepo.create as jest.Mock).mockRejectedValueOnce(
      new Error('db düştü')
    );

    await expect(
      t.handler.execute(new ReceiveInboundMessageCommand(baseInput))
    ).rejects.toThrow('db düştü');

    expect(t.messagingCache.inboundDedup.release).toHaveBeenCalledTimes(1);
  });

  it('başarılı işlemede kilit BIRAKILMAZ (TTL boyunca dedup işareti kalır)', async () => {
    const t = build({});

    await t.handler.execute(new ReceiveInboundMessageCommand(baseInput));

    expect(t.messagingCache.inboundDedup.release).not.toHaveBeenCalled();
  });

  it('gelen metin AI bağlam penceresine user turu olarak eklenir', async () => {
    const t = build({});

    await t.handler.execute(new ReceiveInboundMessageCommand(baseInput));

    expect(t.aiMemoryCache.append).toHaveBeenCalledWith({
      conversationId: t.getSavedConversation()!.id,
      message: { role: 'user', content: 'merhaba' },
    });
  });
});
