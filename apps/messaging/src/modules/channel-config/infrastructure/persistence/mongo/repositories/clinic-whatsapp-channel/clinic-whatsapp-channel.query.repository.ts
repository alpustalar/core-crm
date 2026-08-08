import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicWhatsappChannel as IClinicWhatsappChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicWhatsappChannelQueryRepository } from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicWhatsappChannelDocument,
  ClinicWhatsappChannelModel,
} from '../../schemas/clinic-whatsapp-channel.schema';

@Injectable()
export class ClinicWhatsappChannelQueryRepository
  extends MongoBaseRepository
  implements IClinicWhatsappChannelQueryRepository
{
  constructor(
    @InjectModel(ClinicWhatsappChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicWhatsappChannelDocument>
  ) {
    super();
  }

  async findByClinicId(
    clinicId: string
  ): Promise<IClinicWhatsappChannel | null> {
    const doc = await this.model.findOne({ clinicId }).lean().exec();
    return doc ? this.toPlain<IClinicWhatsappChannel>(doc) : null;
  }

  async findByPhoneNumberId(
    phoneNumberId: string
  ): Promise<IClinicWhatsappChannel | null> {
    const doc = await this.model.findOne({ phoneNumberId }).lean().exec();
    return doc ? this.toPlain<IClinicWhatsappChannel>(doc) : null;
  }
}
