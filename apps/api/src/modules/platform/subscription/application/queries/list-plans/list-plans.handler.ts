import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPlansQuery } from './list-plans.query';
import { ListPlansResponse } from './list-plans.response';
import {
  IPlanQueryRepository,
  PLAN_QUERY_REPOSITORY,
} from '@modules/platform/subscription/domain/repositories/plan/plan.query.repository';

@QueryHandler(ListPlansQuery)
export class ListPlansHandler
  implements IQueryHandler<ListPlansQuery, ListPlansResponse>
{
  constructor(
    @Inject(PLAN_QUERY_REPOSITORY)
    private readonly planRepo: IPlanQueryRepository
  ) {}

  async execute(): Promise<ListPlansResponse> {
    const plans = await this.planRepo.findAllActiveWithModules();
    return { data: plans };
  }
}
