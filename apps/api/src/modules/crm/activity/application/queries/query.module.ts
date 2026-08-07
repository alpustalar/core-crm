import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ActivityRepositoryModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/activity/activity.repository.module';
import { GetActivitiesByLeadHandler } from './get-activities-by-lead/get-activities-by-lead.handler';
import { GetMyTasksHandler } from './get-my-tasks/get-my-tasks.handler';

export const ACTIVITY_QUERY_HANDLERS = [
  GetActivitiesByLeadHandler,
  GetMyTasksHandler,
];

@Module({
  imports: [CqrsModule, ActivityRepositoryModule],
  providers: ACTIVITY_QUERY_HANDLERS,
  exports: ACTIVITY_QUERY_HANDLERS,
})
export class ActivityQueryModule {}
