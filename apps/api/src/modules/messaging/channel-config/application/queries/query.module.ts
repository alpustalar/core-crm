import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicWhatsappChannelHandler } from './get-clinic-whatsapp-channel/get-clinic-whatsapp-channel.handler';
import { FindWhatsappChannelByPhoneNumberIdHandler } from './find-whatsapp-channel-by-phone-number-id/find-whatsapp-channel-by-phone-number-id.handler';
import { ClinicWhatsappChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-whatsapp-channel/clinic-whatsapp-channel.repository.module';

const QueryHandlers = [
  GetClinicWhatsappChannelHandler,
  FindWhatsappChannelByPhoneNumberIdHandler,
];

@Module({
  imports: [CqrsModule, ClinicWhatsappChannelRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class WhatsappChannelQueryModule {}
