import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MarkNotificationReadHandler } from './mark-notification-read/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './mark-all-notifications-read/mark-all-notifications-read.handler';
import { StaffNotificationRepositoryModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/staff-notification/staff-notification.repository.module';

const CommandHandlers = [
  MarkNotificationReadHandler,
  MarkAllNotificationsReadHandler,
];

@Module({
  imports: [CqrsModule, StaffNotificationRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class NotificationCommandModule {}
