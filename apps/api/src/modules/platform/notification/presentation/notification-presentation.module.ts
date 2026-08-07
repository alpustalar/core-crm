import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationQueryModule } from '@modules/platform/notification/application/queries/query.module';
import { NotificationCommandModule } from '@modules/platform/notification/application/commands/command.module';
import { NotificationRealtimeModule } from '@modules/platform/notification/infrastructure/realtime/notification-realtime.module';
import { NotificationCacheService } from '@modules/platform/notification/infrastructure/cache/notification-cache.service';

@Module({
  imports: [
    NotificationQueryModule,
    NotificationCommandModule,
    NotificationRealtimeModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationCacheService],
})
export class NotificationPresentationModule {}
