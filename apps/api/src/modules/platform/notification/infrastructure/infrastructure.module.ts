import { Module } from '@nestjs/common';
import { NotificationRepositoriesModule } from '@modules/platform/notification/infrastructure/persistence/prisma/repositories/repositories.module';
import { NotificationEventModule } from '@modules/platform/notification/infrastructure/messaging/events/notification-event.module';
import { NOTIFICATION_CACHE_SERVICE } from '@modules/platform/notification/domain/interfaces/notification-cache.service.interface';
import { NotificationCacheService } from '@modules/platform/notification/infrastructure/cache/notification-cache.service';

const NotificationInfrastructureModules = [
  NotificationRepositoriesModule,
  NotificationEventModule,
];

@Module({
  imports: [...NotificationInfrastructureModules],
  providers: [
    { provide: NOTIFICATION_CACHE_SERVICE, useClass: NotificationCacheService },
  ],
  exports: [...NotificationInfrastructureModules, NOTIFICATION_CACHE_SERVICE],
})
export class NotificationInfrastructureModule {}
