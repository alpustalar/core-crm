import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CLINIC_INSTAGRAM_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_INSTAGRAM_CHANNEL_QUERY_REPOSITORY,
} from '@modules/channel-config/domain/repositories/clinic-instagram-channel.repository';
import {
  ClinicInstagramChannelModel,
  ClinicInstagramChannelSchema,
} from '../../schemas/clinic-instagram-channel.schema';
import { ClinicInstagramChannelCommandRepository } from './clinic-instagram-channel.command.repository';
import { ClinicInstagramChannelQueryRepository } from './clinic-instagram-channel.query.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ClinicInstagramChannelModel.name,
          schema: ClinicInstagramChannelSchema,
        },
      ],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
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
