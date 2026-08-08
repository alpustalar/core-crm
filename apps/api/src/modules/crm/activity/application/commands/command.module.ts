import { Module } from '@nestjs/common';
import { CreateActivityHandler } from './create-activity/create-activity.handler';
import { UpdateActivityHandler } from './update-activity/update-activity.handler';
import { CompleteActivityHandler } from './complete-activity/complete-activity.handler';
import { DeleteActivityHandler } from './delete-activity/delete-activity.handler';
import { ActivityInfrastructureModule } from '@modules/crm/activity/infrastructure/infrastructure.module';

export const ACTIVITY_COMMAND_HANDLERS = [
  CreateActivityHandler,
  UpdateActivityHandler,
  CompleteActivityHandler,
  DeleteActivityHandler,
];

@Module({
  imports: [ActivityInfrastructureModule],
  providers: ACTIVITY_COMMAND_HANDLERS,
  exports: ACTIVITY_COMMAND_HANDLERS,
})
export class ActivityCommandModule {}
