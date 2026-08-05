import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MatchLeadToPatientCommand } from './match-lead-to-patient.command';
import { MatchLeadToPatientResponse } from './match-lead-to-patient.response';
import {
  IMetaLeadCommandRepository,
  META_LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@CommandHandler(MatchLeadToPatientCommand)
export class MatchLeadToPatientHandler implements ICommandHandler<
  MatchLeadToPatientCommand,
  MatchLeadToPatientResponse
> {
  constructor(
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly metaLeadCommandRepository: IMetaLeadCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: MatchLeadToPatientCommand
  ): Promise<MatchLeadToPatientResponse> {
    const { leadId, patientId, ctx } = command.payload;

    const lead = await this.metaLeadCommandRepository.findById(leadId);
    if (!lead) throw new LeadNotFoundException();

    // TODO: leadid ya da başka bi FK ile clinic id çekmek için handler oluşturulacak. clinic id çekilip policy uygulanacak

    lead.matchToPatient(patientId);

    const saved = await this.metaLeadCommandRepository.update(lead);

    return { leadId: saved.id.value, status: saved.status };
  }
}
