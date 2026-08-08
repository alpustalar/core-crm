import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicInstagramChannel as IClinicInstagramChannel } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IClinicInstagramChannelCommandRepository } from '@modules/channel-config/domain/repositories/clinic-instagram-channel.repository';
import { ClinicInstagramChannel } from '@modules/channel-config/domain/entities/clinic-instagram-channel.entity';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ClinicInstagramChannelDocument,
  ClinicInstagramChannelModel,
} from '../../schemas/clinic-instagram-channel.schema';

@Injectable()
export class ClinicInstagramChannelCommandRepository
  extends MongoBaseRepository
  implements IClinicInstagramChannelCommandRepository
{
  constructor(
    @InjectModel(ClinicInstagramChannelModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ClinicInstagramChannelDocument>
  ) {
    super();
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicInstagramChannel | null> {
    const doc = await this.model
      .findOne({ clinicId })
      .session(this.session)
      .lean()
      .exec();
    return doc
      ? new ClinicInstagramChannel(this.toPlain<IClinicInstagramChannel>(doc))
      : null;
  }

  /** 1:1 satellite (clinicId unique) → get-or-create (upsert). */
  async upsertByClinicId(
    entity: ClinicInstagramChannel
  ): Promise<ClinicInstagramChannel> {
    const { id, ...data } = entity.toPersistence();

    const doc = await this.model
      .findOneAndUpdate(
        { clinicId: data.clinicId },
        {
          $set: {
            igUserId: data.igUserId,
            pageId: data.pageId,
            username: data.username,
            accessToken: data.accessToken,
            isActive: data.isActive,
            tokenExpiresAt: data.tokenExpiresAt,
            lastError: data.lastError,
            updatedAt: data.updatedAt,
          },
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
    return new ClinicInstagramChannel(
      this.toPlain<IClinicInstagramChannel>(doc)
    );
  }
}
