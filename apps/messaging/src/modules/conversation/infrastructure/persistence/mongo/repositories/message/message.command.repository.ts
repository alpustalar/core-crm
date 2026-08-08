import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message as IMessage } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IMessageCommandRepository } from '@modules/conversation/domain/repositories/message.repository';
import { Message } from '@modules/conversation/domain/entities/message.entity';
import { MessageDocument, MessageModel } from '../../schemas/message.schema';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

@Injectable()
export class MessageCommandRepository
  extends MongoBaseRepository
  implements IMessageCommandRepository
{
  constructor(
    @InjectModel(MessageModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<MessageDocument>
  ) {
    super();
  }

  async findById(id: string): Promise<Message | null> {
    const doc = await this.model
      .findById(id)
      .session(this.session)
      .lean()
      .exec();
    return doc ? new Message(this.toPlain<IMessage>(doc)) : null;
  }

  async findByIdForUpdate(id: string): Promise<Message | null> {
    const doc = await this.lockDocument(
      this.model,
      { _id: id },
      'findByIdForUpdate'
    );
    return doc ? new Message(this.toPlain<IMessage>(doc)) : null;
  }

  async findByExternalId(externalId: string): Promise<Message | null> {
    const doc = await this.model
      .findOne({ externalId })
      .session(this.session)
      .lean()
      .exec();
    return doc ? new Message(this.toPlain<IMessage>(doc)) : null;
  }

  async findByExternalIdForUpdate(externalId: string): Promise<Message | null> {
    const doc = await this.lockDocument(
      this.model,
      { externalId },
      'findByExternalIdForUpdate'
    );
    return doc ? new Message(this.toPlain<IMessage>(doc)) : null;
  }

  async create(entity: Message): Promise<Message> {
    const { id, ...data } = entity.toPersistence();

    const [doc] = await this.model.create([{ _id: id, ...data }], {
      session: this.session ?? undefined,
    });
    entity.flushEvents();

    return new Message(this.toPlain<IMessage>(doc.toObject()));
  }

  async update(entity: Message): Promise<Message> {
    const data = entity.toPersistence();

    // Yalnız teslim yaşam döngüsü alanları güncellenir (Prisma tarafındaki davranışın
    // aynısı): mesaj gövdesi/tipi yazıldıktan sonra değişmez.
    const doc = await this.model
      .findByIdAndUpdate(
        data.id,
        {
          $set: {
            status: data.status,
            externalId: data.externalId,
            errorReason: data.errorReason,
            errorCode: data.errorCode,
            pricingCategory: data.pricingCategory,
            billable: data.billable,
            updatedAt: data.updatedAt,
          },
        },
        { new: true }
      )
      .session(this.session)
      .lean()
      .exec();

    if (!doc) {
      throw new Error(`Güncellenecek mesaj bulunamadı: ${data.id}`);
    }

    entity.flushEvents();
    return new Message(this.toPlain<IMessage>(doc));
  }
}
