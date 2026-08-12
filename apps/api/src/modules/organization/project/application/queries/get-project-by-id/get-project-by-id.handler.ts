import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  IProjectQueryRepository,
  PROJECT_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project/project.query.repository';
import { GetProjectByIdQuery } from './get-project-by-id.query';
import { GetProjectByIdResponse } from './get-project-by-id.response';

@QueryHandler(GetProjectByIdQuery)
export class GetProjectByIdHandler implements IQueryHandler<
  GetProjectByIdQuery,
  GetProjectByIdResponse
> {
  constructor(
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepo: IProjectQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetProjectByIdQuery): Promise<GetProjectByIdResponse> {
    const row = await this.projectQueryRepo.findByIdWithPhases(query.projectId);
    if (!row) return { data: null };

    const { evaluator, policy } = this.policyFactory.project(
      query.ctx.actor,
      query.ctx.source
    );

    evaluator
      .check((p) => p.canAccessClinicProjects(row.clinicId))
      .orThrow('project.get');

    const taskCounts = await this.projectQueryRepo.taskStatusCounts(
      query.projectId
    );

    const { phases, ...project } = row;

    return {
      data: { project, phases, taskCounts },
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: row.clinicId,
        }),
      },
    };
  }
}
