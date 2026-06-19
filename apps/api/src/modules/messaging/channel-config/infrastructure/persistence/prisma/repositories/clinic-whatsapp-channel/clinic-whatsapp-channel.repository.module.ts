import { Module } from '@nestjs/common';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannelCommandRepository } from './clinic-whatsapp-channel.command.repository';
import { ClinicWhatsappChannelQueryRepository } from './clinic-whatsapp-channel.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
      useClass: ClinicWhatsappChannelCommandRepository,
    },
    {
      provide: CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
      useClass: ClinicWhatsappChannelQueryRepository,
    },
  ],
  exports: [
    CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
    CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  ],
})
export class ClinicWhatsappChannelRepositoryModule {}
