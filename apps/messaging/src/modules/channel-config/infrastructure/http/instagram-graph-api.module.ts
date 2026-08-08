import { Module } from '@nestjs/common';
import {
  INSTAGRAM_GRAPH_API,
  INSTAGRAM_GRAPH_API_CONFIG,
} from '@modules/channel-config/domain/interfaces/instagram-graph-api.interface';
import { InstagramGraphApiService } from './instagram-graph-api.service';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants';

@Module({
  providers: [
    { provide: INSTAGRAM_GRAPH_API, useClass: InstagramGraphApiService },
    {
      provide: INSTAGRAM_GRAPH_API_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        appId: config.getOrThrow<string>(ENV.INSTAGRAM_APP_ID),
        appSecret: config.getOrThrow<string>(ENV.INSTAGRAM_APP_SECRET),
      }),
    },
  ],
  exports: [INSTAGRAM_GRAPH_API],
})
export class InstagramGraphApiModule {}
