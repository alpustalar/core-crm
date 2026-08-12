import { Module } from '@nestjs/common';
import { NotificationQueryController } from '@modules/platform/notification/presentation/http/controllers/notification.query.controller';
import { NotificationCommandController } from '@modules/platform/notification/presentation/http/controllers/notification.command.controller';
import { NotificationRealtimeModule } from '@modules/platform/notification/infrastructure/realtime/notification-realtime.module';
import { NotificationInfrastructureModule } from '@modules/platform/notification/infrastructure/infrastructure.module';

@Module({
  imports: [NotificationRealtimeModule, NotificationInfrastructureModule],
  controllers: [NotificationQueryController, NotificationCommandController],
})
export class NotificationPresentationModule {}
