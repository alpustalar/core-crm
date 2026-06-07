import { IQuery } from '@nestjs/cqrs';
import { GetActiveSubscriptionQueryResponse } from '@modules/finance/subscription/application/queries/get-active-subscription/get-active-subscription.response';

export class GetActiveSubscriptionQuery implements IQuery {
  readonly __responseType!: GetActiveSubscriptionQueryResponse;
  constructor(public readonly organizationId: string) {}
}
