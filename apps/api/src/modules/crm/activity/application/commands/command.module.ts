import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ActivityRepositoryModule } from '@modules/crm/activity/infrastructure/persistence/prisma/repositories/activity/activity.repository.module';
import { CreateActivityHandler } from './create-activity/create-activity.handler';
import { UpdateActivityHandler } from './update-activity/update-activity.handler';
import { CompleteActivityHandler } from './complete-activity/complete-activity.handler';
import { DeleteActivityHandler } from './delete-activity/delete-activity.handler';

export const ACTIVITY_COMMAND_HANDLERS = [
  CreateActivityHandler,
  UpdateActivityHandler,
  CompleteActivityHandler,
  DeleteActivityHandler,
];

@Module({
  imports: [CqrsModule, ActivityRepositoryModule],
  providers: ACTIVITY_COMMAND_HANDLERS,
  exports: ACTIVITY_COMMAND_HANDLERS,
})
export class ActivityCommandModule {}
