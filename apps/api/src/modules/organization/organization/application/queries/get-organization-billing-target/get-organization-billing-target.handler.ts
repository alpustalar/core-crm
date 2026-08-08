import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BillingTargetSchema } from '@input-type-schemas/BillingTargetSchema';
import { GetOrganizationBillingTargetQuery } from './get-organization-billing-target.query';
import { GetOrganizationBillingTargetResponse } from './get-organization-billing-target.response';
import {
  IOrganizationFinanceSettingsQueryRepository,
  ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization-finance-settings/organization-finance-settings.query.repository';

@QueryHandler(GetOrganizationBillingTargetQuery)
export class GetOrganizationBillingTargetHandler
  implements
    IQueryHandler<
      GetOrganizationBillingTargetQuery,
      GetOrganizationBillingTargetResponse
    >
{
  constructor(
    @Inject(ORGANIZATION_FINANCE_SETTINGS_QUERY_REPOSITORY)
    private readonly organizationFinanceSettingsRepo: IOrganizationFinanceSettingsQueryRepository
  ) {}

  async execute(
    query: GetOrganizationBillingTargetQuery
  ): Promise<GetOrganizationBillingTargetResponse> {
    const settings =
      await this.organizationFinanceSettingsRepo.findByOrganizationId(
        query.organizationId
      );
    // Satır henüz yoksa DB default'u geçerli: ORGANIZATION (org merkezî faturalandırma).
    return {
      data:
        settings?.subscriptionBillingTarget ??
        BillingTargetSchema.enum.ORGANIZATION,
    };
  }
}
