import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetActiveSubscriptionQuery } from './get-active-subscription.query';
import { GetActiveSubscriptionQueryResponse } from './get-active-subscription.response';
import {
  ISubscriptionQueryRepository,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import {
  IPlanQueryRepository,
  PLAN_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan.repository.interface';
import { QueryResponse } from '@shared/common/response/response.interface';
import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';

@QueryHandler(GetActiveSubscriptionQuery)
export class GetActiveSubscriptionHandler
  implements
    IQueryHandler<
      GetActiveSubscriptionQuery,
      QueryResponse<GetActiveSubscriptionQueryResponse | null>
    >
{
  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository,
    @Inject(PLAN_QUERY_REPOSITORY)
    private readonly planQueryRepo: IPlanQueryRepository
  ) {}

  async execute(
    query: GetActiveSubscriptionQuery
  ): Promise<QueryResponse<GetActiveSubscriptionQueryResponse | null>> {
    const data = await this.subscriptionQueryRepo.findByOrganizationId(
      query.organizationId
    );
    if (!data) return { data: null };

    // Aboneliğin plan item'ından plan bundle modüllerini türet (entitlement görünümü).
    const planItem = data.items.find((item) => item.planId != null);
    if (planItem?.planId) {
      const plan = await this.planQueryRepo.findByPlanIdWithModules(
        planItem.planId as PlanId
      );
      if (plan) data.planModules = plan.modules;
    }

    return { data };
  }
}
