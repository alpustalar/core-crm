import { Module } from '@nestjs/common';
import { StaffNotificationRepositoryModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/staff-notification/staff-notification.repository.module';

const NotificationRepositoriesModules = [StaffNotificationRepositoryModule];

@Module({
  imports: [...NotificationRepositoriesModules],
  exports: [...NotificationRepositoriesModules],
})
export class NotificationRepositoriesModule {}
