import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLeadStatusCommand } from './update-lead-status.command';
import { UpdateLeadStatusResponse } from './update-lead-status.response';
import {
  LEAD_COMMAND_REPOSITORY,
  LEAD_QUERY_REPOSITORY,
  ILeadCommandRepository,
  ILeadQueryRepository,
} from '@modules/lead/domain/repositories/lead.repository.interface';
import {
  LEAD_EVENT_PUBLISHER,
  ILeadEventPublisher,
} from '@modules/lead/domain/interfaces/lead-event-publisher.interface';
import { LeadStatus } from '@prisma/client';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(UpdateLeadStatusCommand)
export class UpdateLeadStatusHandler
  implements ICommandHandler<UpdateLeadStatusCommand, UpdateLeadStatusResponse>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
  ) {}

  async execute(command: UpdateLeadStatusCommand): Promise<UpdateLeadStatusResponse> {
    const { leadId, dto, ctx } = command;
    const { actor } = ctx;

    const lead = await this.leadQueryRepo.findById(leadId);
    if (!lead) throw new NotFoundException('Lead bulunamadı.');

    const previousStatus = lead.status;

    if (dto.status === 'CONTACTED') {
      lead.contact();
    } else if (dto.status === 'QUALIFIED') {
      lead.qualify();
    }

    if (dto.notes) lead.updateNotes(dto.notes);

    const saved = await this.leadCommandRepo.save(lead);

    this.eventPublisher.leadStatusChanged({
      leadId: lead.id,
      clinicId: lead.clinicId,
      previousStatus,
      newStatus: saved.status as LeadStatus,
      actorId: actor.userId,
      source: LogSource.WEB,
      action: LogAction.LEAD_STATUS_CHANGED,
      type: LogType.INFO,
      details: `Lead durumu güncellendi: ${previousStatus} → ${saved.status}`,
    });

    return { id: saved.id, status: saved.status };
  }
}
