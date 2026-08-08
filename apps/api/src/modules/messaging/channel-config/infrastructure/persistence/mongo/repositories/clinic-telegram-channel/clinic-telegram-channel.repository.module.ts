import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CLINIC_TELEGRAM_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_TELEGRAM_CHANNEL_QUERY_REPOSITORY,
} from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import {
  ClinicTelegramChannelModel,
  ClinicTelegramChannelSchema,
} from '../../schemas/clinic-telegram-channel.schema';
import { ClinicTelegramChannelCommandRepository } from './clinic-telegram-channel.command.repository';
import { ClinicTelegramChannelQueryRepository } from './clinic-telegram-channel.query.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ClinicTelegramChannelModel.name,
          schema: ClinicTelegramChannelSchema,
        },
      ],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
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
