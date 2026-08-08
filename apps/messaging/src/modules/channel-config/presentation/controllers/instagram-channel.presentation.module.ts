import { Module } from '@nestjs/common';
import { InstagramChannelController } from './instagram-channel.controller';
import { InstagramChannelCommandModule } from '@modules/channel-config/application/commands/instagram-channel-command.module';
import { InstagramChannelQueryModule } from '@modules/channel-config/application/queries/instagram-channel-query.module';

@Module({
  imports: [InstagramChannelCommandModule, InstagramChannelQueryModule],
  controllers: [InstagramChannelController],
})
export class InstagramChannelPresentationModule {}
