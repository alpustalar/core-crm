import { Module } from '@nestjs/common';
import { PROJECT_COMMAND_REPOSITORY } from '@modules/organization/project/domain/repositories/project/project.command.repository';
import { PROJECT_QUERY_REPOSITORY } from '@modules/organization/project/domain/repositories/project/project.query.repository';
import { PROJECT_PHASE_COMMAND_REPOSITORY } from '@modules/organization/project/domain/repositories/project-phase/project-phase.command.repository';
import { PROJECT_TASK_COMMAND_REPOSITORY } from '@modules/organization/project/domain/repositories/project-task/project-task.command.repository';
import { PROJECT_TASK_QUERY_REPOSITORY } from '@modules/organization/project/domain/repositories/project-task/project-task.query.repository';
import { PROJECT_COST_COMMAND_REPOSITORY } from '@modules/organization/project/domain/repositories/project-cost/project-cost.command.repository';
import { PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY } from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.command.repository';
import { PROJECT_RESOURCE_ALLOCATION_QUERY_REPOSITORY } from '@modules/organization/project/domain/repositories/project-resource-allocation/project-resource-allocation.query.repository';
import { ProjectCommandRepository } from './project/project.command.repository';
import { ProjectQueryRepository } from './project/project.query.repository';
import { ProjectPhaseCommandRepository } from './project-phase/project-phase.command.repository';
import { ProjectTaskCommandRepository } from './project-task/project-task.command.repository';
import { ProjectTaskQueryRepository } from './project-task/project-task.query.repository';
import { ProjectCostCommandRepository } from './project-cost/project-cost.command.repository';
import { ProjectResourceAllocationCommandRepository } from './project-resource-allocation/project-resource-allocation.command.repository';
import { ProjectResourceAllocationQueryRepository } from './project-resource-allocation/project-resource-allocation.query.repository';

const PROVIDERS = [
  { provide: PROJECT_COMMAND_REPOSITORY, useClass: ProjectCommandRepository },
  { provide: PROJECT_QUERY_REPOSITORY, useClass: ProjectQueryRepository },
  {
    provide: PROJECT_PHASE_COMMAND_REPOSITORY,
    useClass: ProjectPhaseCommandRepository,
  },
  {
    provide: PROJECT_TASK_COMMAND_REPOSITORY,
    useClass: ProjectTaskCommandRepository,
  },
  {
    provide: PROJECT_TASK_QUERY_REPOSITORY,
    useClass: ProjectTaskQueryRepository,
  },
  {
    provide: PROJECT_COST_COMMAND_REPOSITORY,
    useClass: ProjectCostCommandRepository,
  },
  {
    provide: PROJECT_RESOURCE_ALLOCATION_COMMAND_REPOSITORY,
    useClass: ProjectResourceAllocationCommandRepository,
  },
  {
    provide: PROJECT_RESOURCE_ALLOCATION_QUERY_REPOSITORY,
    useClass: ProjectResourceAllocationQueryRepository,
  },
];

@Module({
  providers: PROVIDERS,
  exports: PROVIDERS.map((p) => p.provide),
})
export class ProjectRepositoryModule {}
