import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConnectClinicInstagramChannelHandler } from './connect-clinic-instagram-channel/connect-clinic-instagram-channel.handler';
import { DisconnectClinicInstagramChannelHandler } from './disconnect-clinic-instagram-channel/disconnect-clinic-instagram-channel.handler';
import { ClinicInstagramChannelRepositoryModule } from '@modules/channel-config/infrastructure/persistence/mongo/repositories/clinic-instagram-channel/clinic-instagram-channel.repository.module';
import { InstagramGraphApiModule } from '@modules/channel-config/infrastructure/http/instagram-graph-api.module';

const CommandHandlers = [
  ConnectClinicInstagramChannelHandler,
  DisconnectClinicInstagramChannelHandler,
];

@Module({
  imports: [
    CqrsModule,
    ClinicInstagramChannelRepositoryModule,
    InstagramGraphApiModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class InstagramChannelCommandModule {}
