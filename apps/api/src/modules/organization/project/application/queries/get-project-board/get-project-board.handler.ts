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
import {
  IProjectTaskQueryRepository,
  PROJECT_TASK_QUERY_REPOSITORY,
} from '@modules/organization/project/domain/repositories/project-task/project-task.query.repository';
import { ProjectNotFoundException } from '@modules/organization/project/domain/exceptions/project.exceptions';
import { GetProjectBoardQuery } from './get-project-board.query';
import { GetProjectBoardResponse } from './get-project-board.response';

@QueryHandler(GetProjectBoardQuery)
export class GetProjectBoardHandler implements IQueryHandler<
  GetProjectBoardQuery,
  GetProjectBoardResponse
> {
  constructor(
    @Inject(PROJECT_TASK_QUERY_REPOSITORY)
    private readonly taskQueryRepo: IProjectTaskQueryRepository,
    @Inject(PROJECT_QUERY_REPOSITORY)
    private readonly projectQueryRepo: IProjectQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetProjectBoardQuery): Promise<GetProjectBoardResponse> {
    const { projectId, filter, ctx } = query.payload;

    // Yetki projenin kliniğine göre verilir; önce projeyi çöz.
    const project = await this.projectQueryRepo.findByIdWithPhases(projectId);
    if (!project) throw new ProjectNotFoundException(projectId);

    this.policyFactory
      .project(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicProjects(project.clinicId))
      .orThrow('project-board.get');

    const tasks = await this.taskQueryRepo.findByProject({
      projectId,
      status: filter.status,
      assigneeId: filter.assigneeId,
      phaseId: filter.phaseId,
    });

    return { data: tasks };
  }
}
