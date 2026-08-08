import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
  CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
} from '@modules/messaging/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import {
  ClinicWhatsappChannelModel,
  ClinicWhatsappChannelSchema,
} from '../../schemas/clinic-whatsapp-channel.schema';
import { ClinicWhatsappChannelCommandRepository } from './clinic-whatsapp-channel.command.repository';
import { ClinicWhatsappChannelQueryRepository } from './clinic-whatsapp-channel.query.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ClinicWhatsappChannelModel.name,
          schema: ClinicWhatsappChannelSchema,
        },
      ],
      MESSAGING_MONGO_CONNECTION
    ),
  ],
  providers: [
    {
      provide: CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
      useClass: ClinicWhatsappChannelCommandRepository,
    },
    {
      provide: CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
      useClass: ClinicWhatsappChannelQueryRepository,
    },
  ],
  exports: [
    CLINIC_WHATSAPP_CHANNEL_COMMAND_REPOSITORY,
    CLINIC_WHATSAPP_CHANNEL_QUERY_REPOSITORY,
  ],
})
export class ClinicWhatsappChannelRepositoryModule {}
