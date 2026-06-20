import { Module } from '@nestjs/common';
import { WHATSAPP_CLOUD_API } from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import { WhatsappCloudApiService } from './whatsapp-cloud-api.service';

@Module({
  providers: [
    { provide: WHATSAPP_CLOUD_API, useClass: WhatsappCloudApiService },
  ],
  exports: [WHATSAPP_CLOUD_API],
})
export class WhatsappCloudApiModule {}
