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
      data: accounts.map((account) => ({
        id: account.id.value,
        clinicId: account.clinicId.value,
        adAccountId: account.adAccountId,
        businessName: account.businessName?.value ?? null,
        isActive: account.isActive,
        lastSyncAt: account.lastSyncAt,
        connectedAt: account.createdAt,
      })),
    };
  }
}
