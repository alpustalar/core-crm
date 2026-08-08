import { Module } from '@nestjs/common';
import { ActivityCommandRepository } from './activity.command.repository';
import { ActivityQueryRepository } from './activity.query.repository';
import { ACTIVITY_COMMAND_REPOSITORY } from '@modules/crm/activity/domain/repositories/activity/activity.command.repository';
import { ACTIVITY_QUERY_REPOSITORY } from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';

@Module({
  providers: [
    {
      provide: ACTIVITY_COMMAND_REPOSITORY,
      useClass: ActivityCommandRepository,
    },
    { provide: ACTIVITY_QUERY_REPOSITORY, useClass: ActivityQueryRepository },
  ],
  exports: [ACTIVITY_COMMAND_REPOSITORY, ACTIVITY_QUERY_REPOSITORY],
})
export class ActivityRepositoryModule {}
