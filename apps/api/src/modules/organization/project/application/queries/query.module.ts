import { Module } from '@nestjs/common';
import { ProjectRepositoriesModule } from '@modules/organization/project/infrastructure/persistence/prisma/repositories/repositories.module';
import { GetProjectsHandler } from './get-projects/get-projects.handler';
import { GetProjectByIdHandler } from './get-project-by-id/get-project-by-id.handler';
import { GetProjectBoardHandler } from './get-project-board/get-project-board.handler';
import { GetMyProjectTasksHandler } from './get-my-project-tasks/get-my-project-tasks.handler';
import { GetProjectBudgetVsActualHandler } from './get-project-budget-vs-actual/get-project-budget-vs-actual.handler';
import { GetResourceScheduleHandler } from './get-resource-schedule/get-resource-schedule.handler';

export const PROJECT_QUERY_HANDLERS = [
  GetProjectsHandler,
  GetProjectByIdHandler,
  GetProjectBoardHandler,
  GetMyProjectTasksHandler,
  GetProjectBudgetVsActualHandler,
  GetResourceScheduleHandler,
];

@Module({
  imports: [ProjectRepositoriesModule],
  providers: PROJECT_QUERY_HANDLERS,
  exports: PROJECT_QUERY_HANDLERS,
})
export class ProjectQueryModule {}
