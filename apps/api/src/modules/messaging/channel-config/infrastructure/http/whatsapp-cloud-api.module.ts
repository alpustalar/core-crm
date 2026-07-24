import { Module } from '@nestjs/common';
import {
  WHATSAPP_CLOUD_API,
  WHATSAPP_CLOUD_API_CONFIG,
} from '@modules/messaging/channel-config/domain/interfaces/whatsapp-cloud-api.interface';
import { WhatsappCloudApiService } from './whatsapp-cloud-api.service';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants';

@Module({
  providers: [
    { provide: WHATSAPP_CLOUD_API, useClass: WhatsappCloudApiService },
    {
      provide: WHATSAPP_CLOUD_API_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appId: config.getOrThrow<string>(ENV.WHATSAPP_APP_ID),
        appSecret: config.getOrThrow<string>(ENV.WHATSAPP_APP_SECRET),
      }),
    },
  ],
  exports: [WHATSAPP_CLOUD_API],
})
export class WhatsappCloudApiModule {}
