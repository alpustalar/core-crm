import { Module } from '@nestjs/common';
import {
  CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
} from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ClinicTelegramChannelCommandRepository } from './clinic-telegram-channel.command.repository';
import { ClinicTelegramChannelQueryRepository } from './clinic-telegram-channel.query.repository';

@Module({
  providers: [
    {
      provide: CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY,
      useClass: ClinicTelegramChannelCommandRepository,
    },
    {
      provide: CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
      useClass: ClinicTelegramChannelQueryRepository,
    },
  ],
  exports: [
    CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY,
    CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
  ],
})
export class ClinicTelegramChannelRepositoryModule {}
