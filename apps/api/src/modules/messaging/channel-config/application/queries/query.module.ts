import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicWhatsappChannelHandler } from './get-clinic-whatsapp-channel/get-clinic-whatsapp-channel.handler';
import { FindWhatsappChannelByPhoneNumberIdHandler } from './find-whatsapp-channel-by-phone-number-id/find-whatsapp-channel-by-phone-number-id.handler';
import { GetWhatsappChannelCredentialsHandler } from './get-whatsapp-channel-credentials/get-whatsapp-channel-credentials.handler';
import { FetchWhatsappMediaHandler } from './fetch-whatsapp-media/fetch-whatsapp-media.handler';
import { GetWhatsappTemplatesHandler } from './get-whatsapp-templates/get-whatsapp-templates.handler';
import { GetWhatsappChannelHealthHandler } from './get-whatsapp-channel-health/get-whatsapp-channel-health.handler';
import { GetWhatsappBusinessProfileHandler } from './get-whatsapp-business-profile/get-whatsapp-business-profile.handler';
import { ClinicWhatsappChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/mongo/repositories/clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';
import { WhatsappCloudApiModule } from '@modules/messaging/channel-config/infrastructure/http/whatsapp-cloud-api.module';

const QueryHandlers = [
  GetClinicWhatsappChannelHandler,
  FindWhatsappChannelByPhoneNumberIdHandler,
  GetWhatsappChannelCredentialsHandler,
  FetchWhatsappMediaHandler,
  GetWhatsappTemplatesHandler,
  GetWhatsappChannelHealthHandler,
  GetWhatsappBusinessProfileHandler,
];

@Module({
  imports: [
    CqrsModule,
    ClinicWhatsappChannelRepositoryModule,
    WhatsappCloudApiModule,
  ],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class WhatsappChannelQueryModule {}
