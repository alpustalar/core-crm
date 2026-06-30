import { Module } from '@nestjs/common';
import {
  CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
} from '@modules/messaging/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannelCommandRepository } from './clinic-instagram-channel.command.repository';
import { ClinicInstagramChannelQueryRepository } from './clinic-instagram-channel.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
      useClass: ClinicInstagramChannelCommandRepository,
    },
    {
      provide: CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
      useClass: ClinicInstagramChannelQueryRepository,
    },
  ],
  exports: [
    CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
    CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
  ],
})
export class ClinicInstagramChannelRepositoryModule {}
