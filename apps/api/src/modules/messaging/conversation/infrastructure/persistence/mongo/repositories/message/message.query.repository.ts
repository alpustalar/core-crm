import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message as IMessage, Pagination } from '@shared';
import { MessageDirectionSchema } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { mongoPaginate } from '@src/infrastructure/persistence/mongo/helpers/mongo-paginate.helper';
import { IMessageQueryRepository } from '@modules/messaging/conversation/domain/repositories/message.repository';
import { MessageDocument, MessageModel } from '../../schemas/message.schema';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';

interface UsageAggregateRow {
  _id: string | null;
  count: number;
}

/** Okuma tarafı: entity hidrate edilmez (veri doğrudan HTTP sınırını geçiyor). */
@Injectable()
export class MessageQueryRepository
  extends MongoBaseRepository
  implements IMessageQueryRepository
{
  constructor(
    @InjectModel(MessageModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<MessageDocument>
  ) {
    super();
  }

  async findById(id: string): Promise<IMessage | null> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.toPlain<IMessage>(doc) : null;
  }

  async findManyByConversation(
    conversationId: string,
    pagination: Pagination
  ): Promise<{ items: IMessage[]; total: number }> {
    const { items, total } = await mongoPaginate<MessageDocument>({
      model: this.model,
      pagination,
      filter: { conversationId },
    });

    return { items: this.toPlainList<IMessage>(items), total };
  }

  async findLatestInboundExternalId(
    conversationId: string
  ): Promise<string | null> {
    const doc = await this.model
      .findOne({
        conversationId,
        direction: MessageDirectionSchema.enum.INBOUND,
        externalId: { $ne: null },
      })
      .sort({ createdAt: -1 })
      .select({ externalId: 1 })
      .lean()
      .exec();

    return doc?.externalId ?? null;
  }

  /**
   * Faturalanabilir mesajları konuşma kategorisine göre sayar (klinik maliyet raporu).
   *
   * Klinik bilgisi mesajda değil yazışmada tutulduğu için `$lookup` ile birleştirilir.
   * Bu, bounded-context ihlali DEĞİLDİR: iki koleksiyon da messaging'in kendi verisidir.
   * Düşük frekanslı bir rapor sorgusu olduğundan `clinicId`'yi mesaja denormalize etmek
   * yerine birleştirme tercih edildi (mesaj yazma yolu sıcak, rapor değil).
   */
  async aggregateUsageByCategory(params: {
    clinicId: string;
    from: Date;
    to: Date;
  }): Promise<Array<{ category: string | null; count: number }>> {
    const rows = await this.model
      .aggregate<UsageAggregateRow>([
        {
          $match: {
            billable: true,
            createdAt: { $gte: params.from, $lte: params.to },
          },
        },
        {
          $lookup: {
            from: 'conversations',
            localField: 'conversationId',
            foreignField: '_id',
            as: 'conversation',
            pipeline: [
              { $match: { clinicId: params.clinicId } },
              { $project: { _id: 1 } },
            ],
          },
        },
        { $match: { 'conversation.0': { $exists: true } } },
        { $group: { _id: '$pricingCategory', count: { $sum: 1 } } },
      ])
      .exec();

    return rows.map((row) => ({ category: row._id, count: row.count }));
  }
}
