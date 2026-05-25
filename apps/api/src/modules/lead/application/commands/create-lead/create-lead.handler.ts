import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreateLeadCommand } from './create-lead.command';
import { CreateLeadResponse } from './create-lead.response';
import {
  LEAD_COMMAND_REPOSITORY,
  ILeadCommandRepository,
} from '@modules/lead/domain/repositories/lead.repository.interface';
import {
  LEAD_EVENT_PUBLISHER,
  ILeadEventPublisher,
} from '@modules/lead/domain/interfaces/lead-event-publisher.interface';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(CreateLeadCommand)
export class CreateLeadHandler
  implements ICommandHandler<CreateLeadCommand, CreateLeadResponse>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
  ) {}

  async execute(command: CreateLeadCommand): Promise<CreateLeadResponse> {
    const { dto, clinicId, ctx } = command;
    const { actor } = ctx;

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

    return {
      id: lead.id,
      clinicId: lead.clinicId,
      source: lead.source,
      status: lead.status,
    };
  }
}
