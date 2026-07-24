import { Module } from '@nestjs/common';
import { ActivityPresentationModule } from './presentation/activity.presentation.module';
import { ActivityCommandModule } from './application/commands/command.module';
import { ActivityQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    ActivityPresentationModule,
    ActivityCommandModule,
    ActivityQueryModule,
  ],
  exports: [ActivityCommandModule, ActivityQueryModule],
})
export class ActivityModule {}
