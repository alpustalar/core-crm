import { ReceiveInboundMessageCommand } from '@modules/messaging/conversation/application/commands/receive-inbound-message/receive-inbound-message.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  IMessageCommandRepository,
  IMessageQueryRepository,
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { detectOptIntent } from '@modules/messaging/conversation/domain/marketing-opt-out';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { MessageChannelSchema } from '@shared';
import { MessageChannel } from '@prisma/client';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { CreateLeadDto } from '@shared/modules/lead/dto/commands';
import { IGetContext } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { SYSTEM_ACTOR } from '@common/constants/system-actor.constant';
import { ExecutionSources } from '@src/domain/constants/execution-source.constant';

@CommandHandler(ReceiveInboundMessageCommand)
export class ReceiveInboundMessageHandler
  implements ICommandHandler<ReceiveInboundMessageCommand, string>
{
  constructor(
    @Inject(CONVERSATION_COMMAND_REPOSITORY)
    private readonly conversationCommandRepo: IConversationCommandRepository,
    @Inject(CONVERSATION_QUERY_REPOSITORY)
    private readonly conversationQueryRepo: IConversationQueryRepository,
    @Inject(MESSAGE_COMMAND_REPOSITORY)
    private readonly messageCommandRepo: IMessageCommandRepository,
    @Inject(MESSAGE_QUERY_REPOSITORY)
    private readonly messageQueryRepo: IMessageQueryRepository,
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReceiveInboundMessageCommand): Promise<string> {
    const { input } = command;

    // idempotemcy check meta aynı mesajı tekrar iletebiliyor
    const existingMessage = await this.messageQueryRepo.findByExternalId(
      input.externalId
    );
    if (existingMessage) return existingMessage.id;

    const patientId = await this.resolvePatientId(input);

    return this.txManager.outboxRun(async () => {
      // resolveConversation ctx içinde çalışıp mükerrerliği engellemeli
      const { conversation, isNew } = await this.resolveConversation(
        command,
        patientId
      );

      // Mevcut (misafir) yazışma sonradan tanınırsa hastaya bağla — yalnız boşken doldur.
      if (patientId && !conversation.patientId) {
        conversation.linkContact({ patientId });
      }

      // Reklamdan (Click-to-Chat) gelen YENİ misafir yazışması → attribution'lı Lead üret
      // ve yazışmaya bağla. recordInboundMessage'dan önce set edilir ki event leadId taşısın.
      if (isNew && !patientId && input.referral?.medium === 'AD') {
        const leadId = await this.createAdReferralLead(input);
        if (leadId) conversation.linkContact({ leadId });
      }

      const message = Message.createInbound({
        conversationId: conversation.id,
        body: input.body,
        mediaUrl: input.mediaUrl,
        type: input.type,
        externalId: input.externalId,
        payload: input.payload,
        replyToExternalId: input.replyToExternalId,
      });

      const savedMessage = await this.messageCommandRepo.create(message);

      conversation.recordInboundMessage({
        messageId: savedMessage.id,
        body: input.body ?? null,
        occurredAt: input.occurredAt,
      });

      // Pazarlama yönelimi kontrolü
      const intent = detectOptIntent(input.body);
      if (intent === 'opt_out') conversation.optOutMarketing();
      else if (intent === 'opt_in') conversation.resumeMarketing();

      // Yeni yazışma INSERT, mevcut olan UPDATE.
      if (isNew) {
        await this.conversationCommandRepo.create(conversation);
      } else {
        await this.conversationCommandRepo.save(conversation);
      }

      return savedMessage.id;
    });
  }

  /**
   * Hasta eşlemesini kanal-farkındalı + güvenli çözer. WhatsApp'ta contactPhone telefondur;
   * Telegram'da contactPhone chatId olduğundan yalnız contact paylaşımıyla gelen matchPhone
   * kullanılır. Eşleşme bulunamazsa (query handler throw edebilir) misafir olarak null döner.
   */
  private async resolvePatientId(
    input: ReceiveInboundMessageCommand['input']
  ): Promise<string | null> {
    const channel = input.channel ?? MessageChannelSchema.enum.WHATSAPP;
    const phone =
      input.matchPhone ??
      (channel === MessageChannelSchema.enum.WHATSAPP
        ? input.contactPhone
        : null);
    if (!phone) return null;

    try {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByContactQuery({ clinicId: input.clinicId, phone })
      );
      return patient?.id ?? null;
    } catch {
      // Hasta bulunamadı → misafir olarak devam (eşleme bloklamaz).
      return null;
    }
  }

  // var olan yazışmayı bul yoksa kilit altında yeni yazışma başlat

  private async resolveConversation(
    command: ReceiveInboundMessageCommand,
    patientId: string | null
  ): Promise<{ conversation: Conversation; isNew: boolean }> {
    const { input } = command;

    const channel = input.channel ?? MessageChannelSchema.enum.WHATSAPP;

    const existing = await this.conversationQueryRepo.findByContact({
      clinicId: input.clinicId,
      channel,
      contactPhone: input.contactPhone,
    });

    if (existing) return { conversation: existing, isNew: false };

    return {
      conversation: Conversation.start({
        clinicId: input.clinicId,
        organizationId: input.organizationId,
        channel,
        contactPhone: input.contactPhone,
        contactName: input.contactName,
        patientId: patientId,
      }),
      isNew: true,
    };
  }

  /**
   * Reklamdan gelen misafir yazışması için attribution'lı Lead oluşturur (cross-module,
   * bus üzerinden). WhatsApp'ta contactPhone gerçek telefondur → lead'e phone yazılır;
   * Instagram/Telegram'da contactPhone IGSID/chatId olduğundan phone boş bırakılır.
   * Dönüş: oluşturulan lead id'si (hata olursa null — mesaj işleme bloklanmaz).
   */
  private async createAdReferralLead(
    input: ReceiveInboundMessageCommand['input']
  ): Promise<string | null> {
    const channel = input.channel ?? MessageChannelSchema.enum.WHATSAPP;
    const referral = input.referral!;

    const dto: CreateLeadDto = {
      source: channel, // WHATSAPP | INSTAGRAM | TELEGRAM — LeadSource ile örtüşür
      name: input.contactName ?? undefined,
      phone:
        channel === MessageChannel.WHATSAPP ? input.contactPhone : undefined,
      medium: 'AD',
      adId: referral.adId ?? undefined,
      ctwaClid: referral.ctwaClid ?? undefined,
      sourceUrl: referral.sourceUrl ?? undefined,
    } as CreateLeadDto;

    try {
      return await this.commandBus.execute(
        new CreateLeadCommand({
          data: dto,
          clinicId: input.clinicId,
          ctx: this.buildSystemContext(input.clinicId, input.organizationId),
        })
      );
    } catch {
      // Lead üretimi mesaj işlemeyi bloklamaz (attribution best-effort).
      return null;
    }
  }

  /** Webhook (actor'sız) akışı için sistem yürütme context'i. */
  private buildSystemContext(
    clinicId: string,
    organizationId: string
  ): IGetContext {
    const actor: ActorContext = {
      ...SYSTEM_ACTOR,
      clinicId,
      organizationId,
      managedClinics: [{ id: clinicId }],
    };
    return {
      actor,
      source: ExecutionSources.INTERNAL_CASCADE,
      ip: '127.0.0.1',
      userAgent: 'WEBHOOK',
    };
  }
}
