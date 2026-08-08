import { Module } from '@nestjs/common';
import { GetMyNotificationsHandler } from './get-my-notifications/get-my-notifications.handler';
import { GetUnreadCountHandler } from './get-unread-count/get-unread-count.handler';
import { NotificationRepositoriesModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetMyNotificationsHandler, GetUnreadCountHandler];

@Module({
  imports: [NotificationRepositoriesModule],
  providers: [...QueryHandlers],
})
export class NotificationQueryModule {}
