import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ProcessMetaLeadCommand } from './process-meta-lead.command';
import { ProcessMetaLeadResponse } from './process-meta-lead.response';
import {
  META_LEAD_COMMAND_REPOSITORY,
  META_LEAD_QUERY_REPOSITORY,
  IMetaLeadCommandRepository,
  IMetaLeadQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';
import {
  META_AD_ACCOUNT_QUERY_REPOSITORY,
  IMetaAdAccountQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import {
  META_ADS_EVENT_PUBLISHER,
  IMetaAdsEventPublisher,
} from '@modules/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { FindPatientByContactQuery } from '@modules/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';
import { FindPatientByContactResponse } from '@modules/patient/application/queries/find-patient-by-contact/find-patient-by-contact.response';
import { LogAction, LogSource, LogType } from '@src/domain/constants/log-action.constant';

@CommandHandler(ProcessMetaLeadCommand)
export class ProcessMetaLeadHandler
  implements ICommandHandler<ProcessMetaLeadCommand, ProcessMetaLeadResponse>
{
  constructor(
    @Inject(META_LEAD_COMMAND_REPOSITORY)
    private readonly leadCommandRepo: IMetaLeadCommandRepository,
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository,
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository,
    @Inject(META_ADS_EVENT_PUBLISHER)
    private readonly eventPublisher: IMetaAdsEventPublisher,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: ProcessMetaLeadCommand,
  ): Promise<ProcessMetaLeadResponse> {
    const { payload } = command;

    const existing = await this.leadQueryRepo.findByMetaLeadId(
      payload.metaLeadId,
    );
    if (existing) {
      return {
        leadId: existing.id,
        status: existing.status,
        matchedPatientId: existing.matchedPatientId,
      };
    }

    const account = await this.accountQueryRepo.findById(
      payload.metaAdAccountId,
    );

    let lead = await this.leadCommandRepo.create({
      id: randomUUID(),
      metaAdAccountId: payload.metaAdAccountId,
      metaLeadId: payload.metaLeadId,
      formId: payload.formId,
      campaignId: payload.campaignId,
      campaignName: payload.campaignName,
      adsetId: payload.adsetId,
      adId: payload.adId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      rawData: (payload.rawData as Record<string, unknown>) ?? null,
    });

    if (account && (payload.phone || payload.email)) {
      const { patient } = await this.queryBus.execute<
        FindPatientByContactQuery,
        FindPatientByContactResponse
      >(
        new FindPatientByContactQuery(
          account.clinicId,
          payload.phone,
          payload.email,
        ),
      );

      if (patient) {
        lead.matchToPatient(patient.id);
        lead = await this.leadCommandRepo.save(lead);
      }
    }

    this.eventPublisher.leadReceived({
      metaLeadId: lead.id,
      clinicId: account?.clinicId ?? '',
      campaignId: lead.campaignId,
      status: lead.status,
      actorId: 'system',
      source: LogSource.SYSTEM,
      action: LogAction.META_ADS_LEAD_RECEIVED,
      type: LogType.INFO,
      details: `Meta lead alındı: ${lead.metaLeadId}`,
    });

    return {
      leadId: lead.id,
      status: lead.status,
      matchedPatientId: lead.matchedPatientId,
    };
  }
}
