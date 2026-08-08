import { Module } from '@nestjs/common';
import { NotificationController } from '@modules/platform/notification/presentation/http/controllers/notification.controller';
import { NotificationRealtimeModule } from '@modules/platform/notification/infrastructure/realtime/notification-realtime.module';
import { NotificationInfrastructureModule } from '@modules/platform/notification/infrastructure/infrastructure.module';

@Module({
  imports: [NotificationRealtimeModule, NotificationInfrastructureModule],
  controllers: [NotificationController],
})
export class NotificationPresentationModule {}
