import { Module } from '@nestjs/common';
import { GetActivitiesByLeadHandler } from './get-activities-by-lead/get-activities-by-lead.handler';
import { GetMyTasksHandler } from './get-my-tasks/get-my-tasks.handler';
import { ActivityRepositoriesModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/repositories.module';

export const ACTIVITY_QUERY_HANDLERS = [
  GetActivitiesByLeadHandler,
  GetMyTasksHandler,
];

@Module({
  imports: [ActivityRepositoriesModule],
  providers: ACTIVITY_QUERY_HANDLERS,
  exports: ACTIVITY_QUERY_HANDLERS,
})
export class ActivityQueryModule {}
