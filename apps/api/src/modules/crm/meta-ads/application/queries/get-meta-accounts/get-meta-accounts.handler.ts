import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaAccountsQuery } from './get-meta-accounts.query';
import { GetMetaAccountsResponse } from './get-meta-accounts.response';
import {
  IMetaAdAccountQueryRepository,
  META_AD_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';

@QueryHandler(GetMetaAccountsQuery)
export class GetMetaAccountsHandler implements IQueryHandler<
  GetMetaAccountsQuery,
  GetMetaAccountsResponse
> {
  constructor(
    @Inject(META_AD_ACCOUNT_QUERY_REPOSITORY)
    private readonly metaAdAccountRepo: IMetaAdAccountQueryRepository
  ) {}

  async execute(query: GetMetaAccountsQuery): Promise<GetMetaAccountsResponse> {
    const accounts = await this.metaAdAccountRepo.findByClinicId(
      query.clinicId
    );

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
    };
  }
}
