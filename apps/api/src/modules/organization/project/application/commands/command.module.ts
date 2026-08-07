import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectRepositoryModule } from '@modules/organization/project/infrastructure/persistence/prisma/repositories/project.repository.module';
import { CreateProjectHandler } from './create-project/create-project.handler';
import { UpdateProjectHandler } from './update-project/update-project.handler';
import { ChangeProjectStatusHandler } from './change-project-status/change-project-status.handler';
import { CreateProjectPhaseHandler } from './create-project-phase/create-project-phase.handler';
import { UpdateProjectPhaseHandler } from './update-project-phase/update-project-phase.handler';
import { CreateProjectTaskHandler } from './create-project-task/create-project-task.handler';
import { UpdateProjectTaskHandler } from './update-project-task/update-project-task.handler';
import { MoveProjectTaskHandler } from './move-project-task/move-project-task.handler';
import { AssignProjectTaskHandler } from './assign-project-task/assign-project-task.handler';
import { RecordProjectCostHandler } from './record-project-cost/record-project-cost.handler';
import { AllocateProjectResourceHandler } from './allocate-project-resource/allocate-project-resource.handler';
import { ReleaseProjectResourceHandler } from './release-project-resource/release-project-resource.handler';

export const PROJECT_COMMAND_HANDLERS = [
  CreateProjectHandler,
  UpdateProjectHandler,
  ChangeProjectStatusHandler,
  CreateProjectPhaseHandler,
  UpdateProjectPhaseHandler,
  CreateProjectTaskHandler,
  UpdateProjectTaskHandler,
  MoveProjectTaskHandler,
  AssignProjectTaskHandler,
  RecordProjectCostHandler,
  AllocateProjectResourceHandler,
  ReleaseProjectResourceHandler,
];

@Module({
  imports: [CqrsModule, ProjectRepositoryModule],
  providers: PROJECT_COMMAND_HANDLERS,
  exports: PROJECT_COMMAND_HANDLERS,
})
export class ProjectCommandModule {}
