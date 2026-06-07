import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateLeadCommand } from './create-lead.command';
import {
  ILeadCommandRepository,
  LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import {
  ILeadEventPublisher,
  LEAD_EVENT_PUBLISHER,
} from '@modules/crm/lead/domain/interfaces/lead-event-publisher.interface';
import {
  LogAction,
  LogSource,
  LogType,
} from '@src/domain/constants/log-action.constant';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(CreateLeadCommand)
export class CreateLeadHandler
  implements ICommandHandler<CreateLeadCommand, string>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CreateLeadCommand): Promise<string> {
    const { dto, clinicId, ctx } = command;
    const { actor } = ctx;

    return this.txManager.run(async () => {
      const lead = await this.leadCommandRepo.create({
        id: randomUUID(),
        clinicId,
        source: dto.source,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
        assignedToId: dto.assignedToId,
      });

      this.eventPublisher.leadCreated({
        leadId: lead.id,
        clinicId,
        leadSource: lead.source,
        actorId: actor.userId,
        source: LogSource.WEB,
        action: LogAction.LEAD_CREATED,
        type: LogType.INFO,
        details: `Lead oluşturuldu: ${lead.source}`,
      });

      return lead.id;
    });
  }
}
