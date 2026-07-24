import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetMyNotificationsHandler } from './get-my-notifications/get-my-notifications.handler';
import { GetUnreadCountHandler } from './get-unread-count/get-unread-count.handler';
import { StaffNotificationRepositoryModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/staff-notification/staff-notification.repository.module';

const QueryHandlers = [GetMyNotificationsHandler, GetUnreadCountHandler];

@Module({
  imports: [CqrsModule, StaffNotificationRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class NotificationQueryModule {}
