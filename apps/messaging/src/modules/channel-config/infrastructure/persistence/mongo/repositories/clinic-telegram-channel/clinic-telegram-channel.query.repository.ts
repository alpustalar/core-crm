import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicTelegramChannel as IClinicTelegramChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicTelegramChannelQueryRepository } from '@modules/channel-config/domain/repositories/clinic-telegram-channel.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicTelegramChannelDocument,
  ClinicTelegramChannelModel,
} from '../../schemas/clinic-telegram-channel.schema';

@Injectable()
export class ClinicTelegramChannelQueryRepository
  extends MongoBaseRepository
  implements IClinicTelegramChannelQueryRepository
{
  constructor(
    @InjectModel(ClinicTelegramChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicTelegramChannelDocument>
  ) {
    super();
  }

  /** Klinik config görünümü + webhook routing: yol parametresindeki clinicId → kanal. */
  async findByClinicId(
    clinicId: string
  ): Promise<IClinicTelegramChannel | null> {
    const doc = await this.model.findOne({ clinicId }).lean().exec();
    return doc ? this.toPlain<IClinicTelegramChannel>(doc) : null;
  }
}
