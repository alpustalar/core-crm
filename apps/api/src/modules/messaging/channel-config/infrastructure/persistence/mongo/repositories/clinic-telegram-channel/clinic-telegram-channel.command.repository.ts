import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicTelegramChannel as IClinicTelegramChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicTelegramChannelCommandRepository } from '@modules/messaging/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { ClinicTelegramChannel } from '@modules/messaging/channel-config/domain/entities/clinic-telegram-channel.entity';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicTelegramChannelDocument,
  ClinicTelegramChannelModel,
} from '../../schemas/clinic-telegram-channel.schema';

@Injectable()
export class ClinicTelegramChannelCommandRepository
  extends MongoBaseRepository
  implements IClinicTelegramChannelCommandRepository
{
  constructor(
    @InjectModel(ClinicTelegramChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicTelegramChannelDocument>
  ) {
    super();
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicTelegramChannel | null> {
    // Klinik başına tek kanal (şu an yalnız BOT_API); provider çoğullanırsa filtre eklenir.
    const doc = await this.model
      .findOne({ clinicId })
      .session(this.session)
      .lean()
      .exec();
    return doc
      ? new ClinicTelegramChannel(this.toPlain<IClinicTelegramChannel>(doc))
      : null;
  }

  /** Satellite (clinicId + provider unique) → get-or-create (upsert). */
  async upsertByClinicAndProvider(
    entity: ClinicTelegramChannel
  ): Promise<ClinicTelegramChannel> {
    const { id, ...data } = entity.toPersistence();

    const doc = await this.model
      .findOneAndUpdate(
        { clinicId: data.clinicId, provider: data.provider },
        {
          $set: {
            status: data.status,
            botTokenEnc: data.botTokenEnc,
            botUsername: data.botUsername,
            webhookSecret: data.webhookSecret,
            phoneNumber: data.phoneNumber,
            mtprotoSessionEnc: data.mtprotoSessionEnc,
            lastError: data.lastError,
            updatedAt: data.updatedAt,
          },
          $setOnInsert: {
            _id: id,
            organizationId: data.organizationId,
            createdAt: data.createdAt,
          },
        },
        { new: true, upsert: true }
      )
      .session(this.session)
      .lean()
      .exec();

    entity.flushEvents();
    return new ClinicTelegramChannel(this.toPlain<IClinicTelegramChannel>(doc));
  }
}
