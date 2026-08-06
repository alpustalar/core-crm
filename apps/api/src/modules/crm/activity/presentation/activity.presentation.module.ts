import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityApplicationModule } from '@modules/crm/activity/application/application.module';

@Module({
  imports: [ActivityApplicationModule],
  controllers: [ActivityController],
})
export class ActivityPresentationModule {}
