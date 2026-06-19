import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MessageChannel } from '@prisma/client';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import {
  CONVERSATION_COMMAND_REPOSITORY,
  CONVERSATION_QUERY_REPOSITORY,
  IConversationCommandRepository,
  IConversationQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/conversation.repository';
import {
  MESSAGE_COMMAND_REPOSITORY,
  MESSAGE_QUERY_REPOSITORY,
  IMessageCommandRepository,
  IMessageQueryRepository,
} from '@modules/messaging/conversation/domain/repositories/message.repository';
import { Conversation } from '@modules/messaging/conversation/domain/entities/conversation.entity';
import { Message } from '@modules/messaging/conversation/domain/entities/message.entity';
import { ReceiveInboundMessageCommand } from './receive-inbound-message.command';

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

    // Idempotency: Meta aynı mesajı tekrar iletebilir.
    const existingMessage = await this.messageQueryRepo.findByExternalId(
      input.externalId
    );
    if (existingMessage) return existingMessage.id;

    return this.txManager.outboxRun(async () => {
      const conversation = await this.resolveConversation(command);

      const message = Message.createInbound({
        conversationId: conversation.id,
        body: input.body,
        mediaUrl: input.mediaUrl,
        type: input.type,
        externalId: input.externalId,
      });
      const savedMessage = await this.messageCommandRepo.save(message);

      conversation.recordInboundMessage({
        messageId: savedMessage.id,
        body: input.body ?? null,
        occurredAt: input.occurredAt,
      });
      await this.conversationCommandRepo.save(conversation);

      return savedMessage.id;
    });
  }

  /** Var olan yazışmayı bulur; yoksa kontak eşlemesini yapıp yeni yazışma başlatır. */
  private async resolveConversation(
    command: ReceiveInboundMessageCommand
  ): Promise<Conversation> {
    const { input } = command;

    const existing = await this.conversationQueryRepo.findByContact({
      clinicId: input.clinicId,
      channel: MessageChannel.WHATSAPP,
      contactPhone: input.contactPhone,
    });
    if (existing) return existing;

    const { data: patient } = await this.queryBus.execute(
      new FindPatientByContactQuery(input.clinicId, input.contactPhone)
    );

    return Conversation.start({
      clinicId: input.clinicId,
      organizationId: input.organizationId,
      channel: MessageChannel.WHATSAPP,
      contactPhone: input.contactPhone,
      contactName: input.contactName,
      patientId: patient?.id ?? null,
    });
  }
}
