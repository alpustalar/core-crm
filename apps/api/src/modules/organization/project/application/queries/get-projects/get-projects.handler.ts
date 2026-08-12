import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectQueryRepository,
  PROJECT_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.query.repository';
import { GetProjectsQuery } from './get-projects.query';
import { GetProjectsResponse } from './get-projects.response';

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<
  GetProjectsQuery,
  GetProjectsResponse
> {
  constructor(
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepo: IProjectQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetProjectsQuery): Promise<GetProjectsResponse> {
    const { filter, pagination, ctx } = query.payload;
    const clinicId = ctx.actor.clinicId ?? '';

    const { evaluator, policy } = this.policyFactory.project(
      ctx.actor,
      ctx.source
    );

    evaluator
      .check((p) => p.canAccessClinicProjects(clinicId))
      .orThrow('project.list');

    const { items, total } = await this.projectQueryRepo.findMany({
      clinicId,
      status: filter.status,
      ownerId: filter.ownerId,
      search: filter.search,
      pagination,
    });

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
        serializationOptions: policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
