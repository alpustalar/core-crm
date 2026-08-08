import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConnectClinicTelegramBotChannelHandler } from './connect-clinic-telegram-bot-channel/connect-clinic-telegram-bot-channel.handler';
import { DisconnectClinicTelegramChannelHandler } from './disconnect-clinic-telegram-channel/disconnect-clinic-telegram-channel.handler';
import { RequestTelegramContactHandler } from './request-telegram-contact/request-telegram-contact.handler';
import { ClinicTelegramChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/mongo/repositories/clinic-telegram-channel/clinic-telegram-channel.repository.module';
import { TelegramBotApiModule } from '@modules/messaging/channel-config/infrastructure/http/telegram-bot-api.module';

const CommandHandlers = [
  ConnectClinicTelegramBotChannelHandler,
  DisconnectClinicTelegramChannelHandler,
  RequestTelegramContactHandler,
];

@Module({
  imports: [
    CqrsModule,
    ClinicTelegramChannelRepositoryModule,
    TelegramBotApiModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class TelegramChannelCommandModule {}
