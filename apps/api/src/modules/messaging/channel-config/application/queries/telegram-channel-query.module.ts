import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicTelegramChannelHandler } from './get-clinic-telegram-channel/get-clinic-telegram-channel.handler';
import { GetTelegramChannelCredentialsHandler } from './get-telegram-channel-credentials/get-telegram-channel-credentials.handler';
import { GetTelegramInboundRoutingHandler } from './get-telegram-inbound-routing/get-telegram-inbound-routing.handler';
import { ClinicTelegramChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-telegram-channel/clinic-telegram-channel.repository.module';

const QueryHandlers = [
  GetClinicTelegramChannelHandler,
  GetTelegramChannelCredentialsHandler,
  GetTelegramInboundRoutingHandler,
];

@Module({
  imports: [CqrsModule, ClinicTelegramChannelRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class TelegramChannelQueryModule {}
