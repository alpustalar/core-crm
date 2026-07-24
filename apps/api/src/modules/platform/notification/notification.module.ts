import { Module } from '@nestjs/common';
import { NotificationCommandModule } from './application/commands/command.module';
import { NotificationQueryModule } from './application/queries/query.module';
import { NotificationEventModule } from './infrastructure/events/notification-event.module';
import { NotificationPresentationModule } from './presentation/notification-presentation.module';

@Module({
  imports: [
    NotificationCommandModule,
    NotificationQueryModule,
    NotificationEventModule,
    NotificationPresentationModule,
  ],
  providers: [],
})
export class NotificationModule {}
