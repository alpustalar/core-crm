import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaAccountsQuery } from './get-meta-accounts.query';
import { GetMetaAccountsResponse } from './get-meta-accounts.response';
import {
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { META_ADS_EVENTS } from '@src/domain/constants/events';

@QueryHandler(GetMetaAccountsQuery)
export class GetMetaAccountsHandler implements IQueryHandler<
  GetMetaAccountsQuery,
  GetMetaAccountsResponse
> {
  constructor(
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly metaAdAccountRepo: IMetaAdAccountQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetMetaAccountsQuery): Promise<GetMetaAccountsResponse> {
    const { clinicId, ctx } = query;

    const { evaluator, policy } = this.policyFactory.clinic(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check(
        (p) => p.actorCanAccessTargetClinic(clinicId),
        'Bu kliniğin reklam hesaplarına erişim yetkiniz yok.'
      )
      .orThrow(META_ADS_EVENTS.ACCOUNTS_LIST);

    const accounts = await this.metaAdAccountRepo.findByClinicId(clinicId);

    return {
      data: accounts.map((account) => ({
        id: account.id,
        clinicId: account.clinicId,
        adAccountId: account.adAccountId,
        businessName: account.businessName,
        isActive: account.isActive,
        lastSyncAt: account.lastSyncAt,
        connectedAt: account.createdAt,
      })),
      meta: {
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
