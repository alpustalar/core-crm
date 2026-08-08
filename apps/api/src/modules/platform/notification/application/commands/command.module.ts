import { Module } from '@nestjs/common';
import { MarkNotificationReadHandler } from './mark-notification-read/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './mark-all-notifications-read/mark-all-notifications-read.handler';
import { NotificationInfrastructureModule } from '@modules/platform/notification/infrastructure/infrastructure.module';

const CommandHandlers = [
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
];

@Module({
  imports: [NotificationInfrastructureModule],
  providers: [...CommandHandlers],
})
export class NotificationCommandModule {}
