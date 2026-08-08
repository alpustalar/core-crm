import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListModulesQuery } from './list-modules.query';
import { ListModulesResponse } from './list-modules.response';
import {
  ISubscriptionQueryRepository,
  SUBSCRIPTION_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/subscription/subscription.query.repository';

@QueryHandler(ListModulesQuery)
export class ListModulesHandler
  implements IQueryHandler<ListModulesQuery, ListModulesResponse>
{
  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly subscriptiobRepo: ISubscriptionQueryRepository
  ) {}

  async execute(): Promise<ListModulesResponse> {
    const modules = await this.subscriptiobRepo.findActiveModules();
    return { data: modules };
  }
}
