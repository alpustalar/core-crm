import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetActiveSubscriptionQuery } from './get-active-subscription.query';
import { GetActiveSubscriptionQueryResponse } from './get-active-subscription.response';
import {
  ISubscriptionQueryRepository,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/finance/subscription/domain/repositories/subscription.repository.interface';
import { QueryResponse } from '@shared/common/response/response.interface';

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
    private readonly subscriptionQueryRepo: ISubscriptionQueryRepository
  ) {}

  async execute(
    query: GetActiveSubscriptionQuery
  ): Promise<QueryResponse<GetActiveSubscriptionQueryResponse | null>> {
    const { organizationId } = query;

    const subscription =
      await this.subscriptionQueryRepo.findByOrganizationId(organizationId);

    if (!subscription) {
      return { data: null };
    }

    return {
      data: {
        id: subscription.id,
        organizationId: subscription.organizationId,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
        items: subscription.items.map((item) => ({
          id: item.id,
          planId: item.planId,
          moduleId: item.moduleId,
          priceAtPurchase: item.priceAtPurchase,
          module: item.module
            ? {
                key: item.module.key,
                name: item.module.name,
                monthlyPrice: item.module.monthlyPrice,
              }
            : null,
        })),
      },
    };
  }
}
