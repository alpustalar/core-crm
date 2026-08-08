import { Module } from '@nestjs/common';
import { TelegramChannelController } from './telegram-channel.controller';
import { TelegramChannelCommandModule } from '@modules/channel-config/application/commands/telegram-channel-command.module';
import { TelegramChannelQueryModule } from '@modules/channel-config/application/queries/telegram-channel-query.module';

@Module({
  imports: [TelegramChannelCommandModule, TelegramChannelQueryModule],
  controllers: [TelegramChannelController],
})
export class TelegramChannelPresentationModule {}
