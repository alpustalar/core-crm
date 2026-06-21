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
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { detectOptIntent } from '@modules/messaging/conversation/domain/marketing-opt-out';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { MessageChannelSchema } from '@shared';

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
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: ReceiveInboundMessageCommand): Promise<string> {
    const { input } = command;

    // idempotemcy check meta aynı mesajı tekrar iletebiliyor
    const existingMessage = await this.messageQueryRepo.findByExternalId(
      input.externalId
    );
    if (existingMessage) return existingMessage.id;

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByContactQuery(input.clinicId, input.contactPhone)
    );
    const patientId = patient?.id ?? null;

    return this.txManager.outboxRun(async () => {
      // resolveConversation ctx içinde çalışıp mükerrerliği engellemeli
      const conversation = await this.resolveConversation(command, patientId);

      const message = Message.createInbound({
        conversationId: conversation.id,
        body: input.body,
        mediaUrl: input.mediaUrl,
        type: input.type,
        externalId: input.externalId,
        payload: input.payload,
        replyToExternalId: input.replyToExternalId,
      });

      const savedMessage = await this.messageCommandRepo.save(message);

      conversation.recordInboundMessage({
        messageId: savedMessage.id,
        body: input.body ?? null,
        occurredAt: input.occurredAt,
      });

      // Pazarlama yönelimi kontrolü
      const intent = detectOptIntent(input.body);
      if (intent === 'opt_out') conversation.optOutMarketing();
      else if (intent === 'opt_in') conversation.resumeMarketing();

      await this.conversationCommandRepo.save(conversation);

      return savedMessage.id;
    });
  }

  // var olan yazışmayı bul yoksa kilit altında yeni yazışma başlat

  private async resolveConversation(
    command: ReceiveInboundMessageCommand,
    patientId: string | null
  ): Promise<Conversation> {
    const { input } = command;

    const existing = await this.conversationQueryRepo.findByContact({
      clinicId: input.clinicId,
      channel: MessageChannelSchema.enum.WHATSAPP,
      contactPhone: input.contactPhone,
    });

    if (existing) return existing;

    return Conversation.start({
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      channel: MessageChannelSchema.enum.WHATSAPP,
      contactPhone: input.contactPhone,
      contactName: input.contactName,
      patientId: patientId,
    });
  }
}
