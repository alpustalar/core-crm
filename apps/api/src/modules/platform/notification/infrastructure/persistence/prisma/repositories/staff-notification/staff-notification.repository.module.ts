import { Module } from '@nestjs/common';
import {
  STAFF_NOTIFICATION_COMMAND_REPOSITORY,
  STAFF_NOTIFICATION_QUERY_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { StaffNotificationCommandRepository } from './staff-notification.command.repository';
import { StaffNotificationQueryRepository } from './staff-notification.query.repository';

@Module({
  providers: [
    {
      provide: STAFF_NOTIFICATION_COMMAND_REPOSITORY,
      useClass: StaffNotificationCommandRepository,
    },
    {
      provide: STAFF_NOTIFICATION_QUERY_REPOSITORY,
      useClass: StaffNotificationQueryRepository,
    },
  ],
  exports: [
    STAFF_NOTIFICATION_COMMAND_REPOSITORY,
    STAFF_NOTIFICATION_QUERY_REPOSITORY,
  ],
})
export class StaffNotificationRepositoryModule {}
