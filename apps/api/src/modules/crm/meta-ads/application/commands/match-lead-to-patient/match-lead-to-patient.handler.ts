import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MatchLeadToPatientCommand } from './match-lead-to-patient.command';
import { MatchLeadToPatientResponse } from './match-lead-to-patient.response';
import {
  IMetaLeadCommandRepository,
  META_LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';

@CommandHandler(MatchLeadToPatientCommand)
export class MatchLeadToPatientHandler
  implements
    ICommandHandler<MatchLeadToPatientCommand, MatchLeadToPatientResponse>
{
  constructor(
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly metaLeadCommandRepository: IMetaLeadCommandRepository
  ) {}

  // TODO lead module oluşturuldu. handler oraya geçirilecek

  async execute(
    command: MatchLeadToPatientCommand
  ): Promise<MatchLeadToPatientResponse> {
    const { leadId, patientId } = command;

    const lead = await this.metaLeadCommandRepository.findById(leadId);
    if (!lead) throw new LeadNotFoundException();

    lead.matchToPatient(patientId);

    const saved = await this.metaLeadCommandRepository.save(lead);

    return { leadId: saved.id.value, status: saved.status };
  }
}
