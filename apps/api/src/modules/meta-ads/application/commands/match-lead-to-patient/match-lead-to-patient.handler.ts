import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MatchLeadToPatientCommand } from './match-lead-to-patient.command';
import { MatchLeadToPatientResponse } from './match-lead-to-patient.response';
import {
  META_LEAD_COMMAND_REPOSITORY,
  META_LEAD_QUERY_REPOSITORY,
  IMetaLeadCommandRepository,
  IMetaLeadQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';

@CommandHandler(MatchLeadToPatientCommand)
export class MatchLeadToPatientHandler
  implements ICommandHandler<MatchLeadToPatientCommand, MatchLeadToPatientResponse>
{
  constructor(
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: IMetaLeadCommandRepository,
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository,
  ) {}

  // TODO lead module oluşturuldu. handler oraya geçirilecek
  
  async execute(
    command: MatchLeadToPatientCommand,
  ): Promise<MatchLeadToPatientResponse> {
    const { leadId, patientId } = command;

    const lead = await this.leadQueryRepo.findById(leadId);
    if (!lead) throw new NotFoundException('Lead bulunamadı.');

    lead.matchToPatient(patientId);
    const saved = await this.leadCommandRepo.save(lead);

    return { leadId: saved.id, status: saved.status };
  }
}
