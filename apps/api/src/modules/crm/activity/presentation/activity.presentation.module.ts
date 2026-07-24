import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityCommandModule } from '@modules/crm/activity/application/commands/command.module';
import { ActivityQueryModule } from '@modules/crm/activity/application/queries/query.module';

@Module({
  imports: [ActivityCommandModule, ActivityQueryModule],
  controllers: [ActivityController],
})
export class ActivityPresentationModule {}
