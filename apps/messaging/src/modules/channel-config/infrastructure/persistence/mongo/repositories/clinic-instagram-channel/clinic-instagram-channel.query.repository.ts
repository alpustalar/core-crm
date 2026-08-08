import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicInstagramChannel as IClinicInstagramChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicInstagramChannelQueryRepository } from '@modules/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicInstagramChannelDocument,
  ClinicInstagramChannelModel,
} from '../../schemas/clinic-instagram-channel.schema';

@Injectable()
export class ClinicInstagramChannelQueryRepository
  extends MongoBaseRepository
  implements IClinicInstagramChannelQueryRepository
{
  constructor(
    @InjectModel(ClinicInstagramChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicInstagramChannelDocument>
  ) {
    super();
  }

  async findByClinicId(
    clinicId: string
  ): Promise<IClinicInstagramChannel | null> {
    const doc = await this.model.findOne({ clinicId }).lean().exec();
    return doc ? this.toPlain<IClinicInstagramChannel>(doc) : null;
  }

  /** Webhook routing: gelen olaydaki IG hesap id'si (entry.id) → kanal (dolayısıyla klinik). */
  async findByIgUserId(
    igUserId: string
  ): Promise<IClinicInstagramChannel | null> {
    const doc = await this.model.findOne({ igUserId }).lean().exec();
    return doc ? this.toPlain<IClinicInstagramChannel>(doc) : null;
  }
}
