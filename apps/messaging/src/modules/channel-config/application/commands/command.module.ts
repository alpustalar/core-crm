import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterClinicWhatsappChannelHandler } from './register-clinic-whatsapp-channel/register-clinic-whatsapp-channel.handler';
import { ConnectClinicWhatsappChannelHandler } from './connect-clinic-whatsapp-channel/connect-clinic-whatsapp-channel.handler';
import { DisconnectClinicWhatsappChannelHandler } from './disconnect-clinic-whatsapp-channel/disconnect-clinic-whatsapp-channel.handler';
import { UpdateWhatsappBusinessProfileHandler } from './update-whatsapp-business-profile/update-whatsapp-business-profile.handler';
import { RecordWhatsappQualityHandler } from './record-whatsapp-quality/record-whatsapp-quality.handler';
import { ClinicWhatsappChannelRepositoryModule } from '@modules/channel-config/infrastructure/persistence/mongo/repositories/clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';
import { WhatsappCloudApiModule } from '@modules/channel-config/infrastructure/http/whatsapp-cloud-api.module';

const CommandHandlers = [
  RegisterClinicWhatsappChannelHandler,
  ConnectClinicWhatsappChannelHandler,
  DisconnectClinicWhatsappChannelHandler,
  UpdateWhatsappBusinessProfileHandler,
  RecordWhatsappQualityHandler,
];

@Module({
  imports: [
    CqrsModule,
    ClinicWhatsappChannelRepositoryModule,
    WhatsappCloudApiModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class WhatsappChannelCommandModule {}
