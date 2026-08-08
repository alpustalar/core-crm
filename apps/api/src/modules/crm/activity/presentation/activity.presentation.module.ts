import { Module } from '@nestjs/common';
import { ActivityController } from '@modules/crm/activity/presentation/http/controllers/activity.controller';

@Module({ controllers: [ActivityController] })
export class ActivityPresentationModule {}
