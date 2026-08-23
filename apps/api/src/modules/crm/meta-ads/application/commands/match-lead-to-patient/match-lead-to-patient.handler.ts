import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MatchLeadToPatientCommand } from './match-lead-to-patient.command';
import { MatchLeadToPatientResponse } from './match-lead-to-patient.response';
import {
  IMetaLeadCommandRepository,
  META_LEAD_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository';
import { LeadNotFoundException } from '@modules/crm/lead/domain/exceptions/lead.exceptions';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IMetaAdAccountCommandRepository,
  META_AD_ACCOUNT_COMMAND_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import { MetaAdsNotFoundException } from '@modules/crm/meta-ads/domain/exceptions/meta-ads.exceptions';
import { META_ADS_EVENTS } from '@src/domain/constants/events';

@CommandHandler(MatchLeadToPatientCommand)
export class MatchLeadToPatientHandler
  implements
    ICommandHandler<MatchLeadToPatientCommand, MatchLeadToPatientResponse>
{
  constructor(
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly metaLeadRepo: IMetaLeadCommandRepository,
    @Inject(META_AD_ACCOUNT_COMMAND_REPOSITORY)
    private readonly metaAdAccountRepo: IMetaAdAccountCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    command: MatchLeadToPatientCommand
  ): Promise<MatchLeadToPatientResponse> {
    const { leadId, patientId, ctx } = command.payload;

    const lead = await this.metaLeadRepo.findById(leadId);
    if (!lead) throw new LeadNotFoundException();

    // Kiracı kapsamı reklam hesabından çözülür: MetaLead'in kendi `clinicId`si yok
    // ama `metaAdAccountId` üzerinden hesabın kliniğine bağlanıyor. Bu kontrol
    // olmadan `metalead:update` yetkisi olan personel BAŞKA kliniğin lead'ini
    // kendi hastasına eşleyebilirdi.
    const adAccount = await this.metaAdAccountRepo.findById(
      lead.metaAdAccountId
    );
    if (!adAccount) throw new MetaAdsNotFoundException();

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessTargetClinic(adAccount.clinicId.value)
      )
      .orThrow(META_ADS_EVENTS.LEAD_MATCHED);

    lead.matchToPatient(patientId);

    const saved = await this.metaLeadRepo.update(lead);

    return { leadId: saved.id.value, status: saved.status };
  }
}
