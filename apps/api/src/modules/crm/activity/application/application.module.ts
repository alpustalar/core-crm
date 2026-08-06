import { Module } from '@nestjs/common';
import { ActivityCommandModule } from '@modules/crm/activity/application/commands/command.module';
import { ActivityQueryModule } from '@modules/crm/activity/application/queries/query.module';

const ApplicationModules = [ActivityCommandModule, ActivityQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ActivityApplicationModule {}
