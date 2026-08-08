import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicWhatsappChannel as IClinicWhatsappChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicWhatsappChannelCommandRepository } from '@modules/channel-config/domain/repositories/clinic-whatsapp-channel.repository';
import { ClinicWhatsappChannel } from '@modules/channel-config/domain/entities/clinic-whatsapp-channel.entity';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicWhatsappChannelDocument,
  ClinicWhatsappChannelModel,
} from '../../schemas/clinic-whatsapp-channel.schema';

@Injectable()
export class ClinicWhatsappChannelCommandRepository
  extends MongoBaseRepository
  implements IClinicWhatsappChannelCommandRepository
{
  constructor(
    @InjectModel(ClinicWhatsappChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicWhatsappChannelDocument>
  ) {
    super();
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicWhatsappChannel | null> {
    const doc = await this.model
      .findOne({ clinicId })
      .session(this.session)
      .lean()
      .exec();
    return doc
      ? new ClinicWhatsappChannel(this.toPlain<IClinicWhatsappChannel>(doc))
      : null;
  }

  async findByDisplayPhoneNumber(
    displayPhoneNumber: string
  ): Promise<ClinicWhatsappChannel | null> {
    const doc = await this.model
      .findOne({ displayPhoneNumber })
      .session(this.session)
      .lean()
      .exec();
    return doc
      ? new ClinicWhatsappChannel(this.toPlain<IClinicWhatsappChannel>(doc))
      : null;
  }

  /** 1:1 satellite (clinicId unique) → get-or-create (upsert). */
  async upsertByClinicId(
    entity: ClinicWhatsappChannel
  ): Promise<ClinicWhatsappChannel> {
    const { id, ...data } = entity.toPersistence();

    const doc = await this.model
      .findOneAndUpdate(
        { clinicId: data.clinicId },
        {
          $set: {
            phoneNumberId: data.phoneNumberId,
            wabaId: data.wabaId,
            displayPhoneNumber: data.displayPhoneNumber,
            accessToken: data.accessToken,
            verifyToken: data.verifyToken,
            isActive: data.isActive,
            registrationPin: data.registrationPin,
            registeredAt: data.registeredAt,
            tokenExpiresAt: data.tokenExpiresAt,
            qualityRating: data.qualityRating,
            messagingTier: data.messagingTier,
            updatedAt: data.updatedAt,
          },
          // Yalnız yeni kayıt oluşurken yazılır; mevcut kaydın kimliği korunur.
          $setOnInsert: {
            _id: id,
            organizationId: data.organizationId,
            createdAt: data.createdAt,
          },
        },
        { returnDocument: 'after' , upsert: true }
      )
      .session(this.session)
      .lean()
      .exec();

    entity.flushEvents();
    return new ClinicWhatsappChannel(this.toPlain<IClinicWhatsappChannel>(doc));
  }
}
