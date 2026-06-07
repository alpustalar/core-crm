import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaAccountsQuery } from './get-meta-accounts.query';
import { GetMetaAccountsResponse } from './get-meta-accounts.response';
import {
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository.interface';

@QueryHandler(GetMetaAccountsQuery)
export class GetMetaAccountsHandler
  implements IQueryHandler<GetMetaAccountsQuery, GetMetaAccountsResponse>
{
  constructor(
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IMetaAdAccountQueryRepository
  ) {}

  async execute(query: GetMetaAccountsQuery): Promise<GetMetaAccountsResponse> {
    const accounts = await this.accountQueryRepo.findByClinicId(query.clinicId);

    return {
      data: accounts.map((a) => ({
        id: a.id,
        clinicId: a.clinicId,
        adAccountId: a.adAccountId,
        businessName: a.businessName,
        isActive: a.isActive,
        lastSyncAt: a.lastSyncAt,
        connectedAt: a.createdAt,
      })),
    };
  }
}
