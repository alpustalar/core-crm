import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  AddModuleInput,
  ISubscriptionModuleApi,
  SubscribeToPlanInput,
} from '@modules/subscription/domain/interfaces/subscription.module.api.interface';
import { SubscribeToPlanCommand } from '@modules/subscription/application/commands/subscribe-to-plan/subscribe-to-plan.command';
import { AddModuleCommand } from '@modules/subscription/application/commands/add-module/add-module.command';
import { GetActiveSubscriptionQuery } from '@modules/subscription/application/queries/get-active-subscription/get-active-subscription.query';
import { GetActiveSubscriptionResponse } from '@modules/subscription/application/queries/get-active-subscription/get-active-subscription.response';
import { QueryResponse } from '@shared/common/response/response.interface';

@Injectable()
export class SubscriptionModuleApi implements ISubscriptionModuleApi {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  subscribeToPlan(input: SubscribeToPlanInput): Promise<void> {
    return this.commandBus.execute(new SubscribeToPlanCommand(input));
  }

  addModule(input: AddModuleInput): Promise<void> {
    return this.commandBus.execute(new AddModuleCommand(input));
  }

  getActiveSubscription(
    organizationId: string
  ): Promise<QueryResponse<GetActiveSubscriptionResponse | null>> {
    return this.queryBus.execute(
      new GetActiveSubscriptionQuery(organizationId)
    );
  }
}
