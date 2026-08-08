import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation as IConversation } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { IConversationCommandRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { Conversation } from '@modules/conversation/domain/entities/conversation.entity';
import { FindConversationByContactProps } from '@modules/conversation/domain/contracts/conversation.contracts';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  ConversationDocument,
  ConversationModel,
} from '../../schemas/conversation.schema';

@Injectable()
export class ConversationCommandRepository
  extends MongoBaseRepository
  implements IConversationCommandRepository
{
  constructor(
    @InjectModel(ConversationModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ConversationDocument>
  ) {
    super();
  }

  async findById(id: string): Promise<Conversation | null> {
    const doc = await this.model
      .findById(id)
      .session(this.session)
      .lean()
      .exec();
    return doc ? new Conversation(this.toPlain<IConversation>(doc)) : null;
  }

  async findByIdForUpdate(id: string): Promise<Conversation | null> {
    const doc = await this.lockDocument(
      this.model,
      { _id: id },
      'findByIdForUpdate'
    );
    return doc ? new Conversation(this.toPlain<IConversation>(doc)) : null;
  }

  async findByContactForUpdate(
    props: FindConversationByContactProps
  ): Promise<Conversation | null> {
    // Yazışma yoksa kilitlenecek doküman da yok; eşzamanlı iki gelen mesajın aynı
    // kontağa iki yazışma açmasını unique indeks engeller (Postgres'teki davranışın aynısı).
    const doc = await this.lockDocument(
      this.model,
      {
        clinicId: props.clinicId,
        channel: props.channel,
        contactPhone: props.contactPhone,
      },
      'findByContactForUpdate'
    );
    return doc ? new Conversation(this.toPlain<IConversation>(doc)) : null;
  }

  async create(entity: Conversation): Promise<Conversation> {
    const { id, ...data } = entity.toPersistence();

    const [doc] = await this.model.create([{ _id: id, ...data }], {
      session: this.session ?? undefined,
    });
    entity.flushEvents();

    return new Conversation(this.toPlain<IConversation>(doc.toObject()));
  }

  async update(entity: Conversation): Promise<Conversation> {
    const data = entity.toPersistence();

    // Değişebilen alanlar açıkça yazılır (Prisma tarafındaki davranışın aynısı):
    // kimlik ve oluşturma bilgisi güncellenmez.
    const doc = await this.model
      .findByIdAndUpdate(
        data.id,
        {
          $set: {
            contactName: data.contactName,
            patientId: data.patientId,
            leadId: data.leadId,
            status: data.status,
            assignedUserId: data.assignedUserId,
            lastMessageAt: data.lastMessageAt,
            lastInboundAt: data.lastInboundAt,
            unreadCount: data.unreadCount,
            agentReadAt: data.agentReadAt,
            windowExpiresAt: data.windowExpiresAt,
            marketingOptOut: data.marketingOptOut,
            optOutAt: data.optOutAt,
            updatedAt: data.updatedAt,
          },
        },
        { new: true }
      )
      .session(this.session)
      .lean()
      .exec();

    if (!doc) {
      throw new Error(`Güncellenecek yazışma bulunamadı: ${data.id}`);
    }

    entity.flushEvents();
    return new Conversation(this.toPlain<IConversation>(doc));
  }
}
