import { Module } from '@nestjs/common';
import { InstagramChannelPresentationModule } from '@modules/channel-config/presentation/controllers/instagram-channel.presentation.module';
import { WhatsappChannelPresentationModule } from '@modules/channel-config/presentation/controllers/whatsapp-channel.presentation.module';
import { TelegramChannelPresentationModule } from '@modules/channel-config/presentation/controllers/telegram-channel.presentation.module';

const Modules = [
  InstagramChannelPresentationModule,
  TelegramChannelPresentationModule,
  WhatsappChannelPresentationModule,
];
@Module({
  imports: Modules,
  exports: Modules,
})
export class ChannelConfigPresentationModule {}
