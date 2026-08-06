import { Module } from '@nestjs/common';
import { ActivityPresentationModule } from './presentation/activity.presentation.module';
import { ActivityInfrastructureModule } from '@modules/crm/activity/infrastructure/infrastructure.module';
import { ActivityApplicationModule } from '@modules/crm/activity/application/application.module';

@Module({
  imports: [
    ActivityPresentationModule,
    ActivityApplicationModule,
    ActivityInfrastructureModule,
  ],
})
export class ActivityModule {}
