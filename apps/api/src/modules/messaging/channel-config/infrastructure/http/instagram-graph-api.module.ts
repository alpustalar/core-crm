import { Module } from '@nestjs/common';
import { INSTAGRAM_GRAPH_API } from '@modules/messaging/channel-config/domain/interfaces/instagram-graph-api.interface';
import { InstagramGraphApiService } from './instagram-graph-api.service';

@Module({
  providers: [
    { provide: INSTAGRAM_GRAPH_API, useClass: InstagramGraphApiService },
  ],
  exports: [INSTAGRAM_GRAPH_API],
})
export class InstagramGraphApiModule {}
