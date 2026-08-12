import { Module } from '@nestjs/common';
import { ActivityQueryController } from '@modules/crm/activity/presentation/http/controllers/activity.query.controller';
import { ActivityCommandController } from '@modules/crm/activity/presentation/http/controllers/activity.command.controller';

@Module({ controllers: [ActivityQueryController, ActivityCommandController] })
export class ActivityPresentationModule {}
