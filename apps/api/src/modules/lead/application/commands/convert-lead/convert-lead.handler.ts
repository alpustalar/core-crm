import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConvertLeadCommand } from './convert-lead.command';
import { ConvertLeadResponse } from './convert-lead.response';
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
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(ConvertLeadCommand)
export class ConvertLeadHandler
  implements ICommandHandler<ConvertLeadCommand, ConvertLeadResponse>
{
  constructor(
    @Inject(LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: ILeadCommandRepository,
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
    @Inject(LEAD_EVENT_PUBLISHER)
    private readonly eventPublisher: ILeadEventPublisher,
  ) {}

  async execute(command: ConvertLeadCommand): Promise<ConvertLeadResponse> {
    const { leadId, dto, ctx } = command;
    const { actor } = ctx;

    const lead = await this.leadQueryRepo.findById(leadId);
    if (!lead) throw new NotFoundException('Lead bulunamadı.');

    lead.convert(dto.patientId ?? null, dto.appointmentId ?? null);
    const saved = await this.leadCommandRepo.save(lead);

    this.eventPublisher.leadConverted({
      leadId: lead.id,
      clinicId: lead.clinicId,
      patientId: saved.patientId,
      appointmentId: saved.appointmentId,
      actorId: actor.userId,
      source: LogSource.WEB,
      action: LogAction.LEAD_CONVERTED,
      type: LogType.INFO,
      details: `Lead dönüştürüldü — hasta: ${saved.patientId ?? '-'}, randevu: ${saved.appointmentId ?? '-'}`,
    });

    return {
      id: saved.id,
      patientId: saved.patientId,
      appointmentId: saved.appointmentId,
      convertedAt: saved.convertedAt!,
    };
  }
}
