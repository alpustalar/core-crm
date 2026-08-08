import { Module } from '@nestjs/common';
import { WhatsappChannelController } from './whatsapp-channel.controller';
import { WhatsappChannelCommandModule } from '@modules/channel-config/application/commands/command.module';
import { WhatsappChannelQueryModule } from '@modules/channel-config/application/queries/query.module';

@Module({
  imports: [WhatsappChannelCommandModule, WhatsappChannelQueryModule],
  controllers: [WhatsappChannelController],
})
export class WhatsappChannelPresentationModule {}
