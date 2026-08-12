import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IProjectTaskQueryRepository,
  PROJECT_TASK_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-task/project-task.query.repository';
import { GetMyProjectTasksQuery } from './get-my-project-tasks.query';
import { GetMyProjectTasksResponse } from './get-my-project-tasks.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

/**
 * "Bana atanan işler". Policy kontrolü yok — sorgu zaten aktörün kendi
 * kimliğiyle sınırlı; başkasının listesini istemenin yolu bu uçtan geçmiyor.
 */
@QueryHandler(GetMyProjectTasksQuery)
export class GetMyProjectTasksHandler implements IQueryHandler<
  GetMyProjectTasksQuery,
  GetMyProjectTasksResponse
> {
  constructor(
    @Inject(PROJECT_TASK_QUERY_REPOSITORY)
    private readonly taskQueryRepo: IProjectTaskQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetMyProjectTasksQuery
  ): Promise<GetMyProjectTasksResponse> {
    const { filter, pagination, ctx } = query.payload;

    const { items, total } = await this.taskQueryRepo.findAssignedTo({
      clinicId: ctx.actor.clinicId ?? '',
      assigneeId: ctx.actor.userId,
      status: filter.status,
      pagination,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        // Liste zaten aktörün kendi userId'sine sabit; yalnız alan görünürlüğü çözülür.
        serializationOptions: this.policyFactory
          .project(ctx.actor, ctx.source)
          .policy.getSerializationOptions({
            clinicId: ctx.actor.clinicId ?? '',
          }),
      },
    };
  }
}
