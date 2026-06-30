import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicInstagramChannelHandler } from './get-clinic-instagram-channel/get-clinic-instagram-channel.handler';
import { GetInstagramChannelCredentialsHandler } from './get-instagram-channel-credentials/get-instagram-channel-credentials.handler';
import { FindInstagramChannelByIgUserIdHandler } from './find-instagram-channel-by-ig-user-id/find-instagram-channel-by-ig-user-id.handler';
import { ClinicInstagramChannelRepositoryModule } from '@modules/messaging/channel-config/infrastructure/persistence/prisma/repositories/clinic-instagram-channel/clinic-instagram-channel.repository.module';

const QueryHandlers = [
  GetClinicInstagramChannelHandler,
  GetInstagramChannelCredentialsHandler,
  FindInstagramChannelByIgUserIdHandler,
];

@Module({
  imports: [CqrsModule, ClinicInstagramChannelRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class InstagramChannelQueryModule {}
