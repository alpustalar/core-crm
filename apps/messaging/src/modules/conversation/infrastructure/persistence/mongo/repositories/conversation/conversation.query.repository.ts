import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model } from 'mongoose';
import { Conversation as IConversation } from '@shared';
import { MongoBaseRepository } from '@src/infrastructure/persistence/mongo/mongo-base.repository';
import { mongoPaginate } from '@src/infrastructure/persistence/mongo/helpers/mongo-paginate.helper';
import { IConversationQueryRepository } from '@modules/conversation/domain/repositories/conversation.repository';
import { MESSAGING_MONGO_CONNECTION } from '@src/infrastructure/persistence/mongo/mongo.connection';
import {
  FindConversationByContactProps,
  FindConversationsFilter,
} from '@modules/conversation/domain/contracts/conversation.contracts';
import {
  ConversationDocument,
  ConversationModel,
} from '../../schemas/conversation.schema';

/** Okuma tarafı: entity hidrate edilmez; karar besleyen okumalar Command Repo'da. */
@Injectable()
export class ConversationQueryRepository
  extends MongoBaseRepository
  implements IConversationQueryRepository
{
  constructor(
    @InjectModel(ConversationModel.name, MESSAGING_MONGO_CONNECTION)
    private readonly model: Model<ConversationDocument>
  ) {
    super();
  }

  async findById(id: string): Promise<IConversation | null> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.toPlain<IConversation>(doc) : null;
  }

  async findByContact(
    props: FindConversationByContactProps
  ): Promise<IConversation | null> {
    const doc = await this.model
      .findOne({
        clinicId: props.clinicId,
        channel: props.channel,
        contactPhone: props.contactPhone,
      })
      .lean()
      .exec();
    return doc ? this.toPlain<IConversation>(doc) : null;
  }

  async findMany(
    filter: FindConversationsFilter
  ): Promise<{ items: IConversation[]; total: number }> {
    const mongoFilter: QueryFilter<ConversationDocument> = {
      clinicId: filter.clinicId,
    };
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.assignedUserId)
      mongoFilter.assignedUserId = filter.assignedUserId;

    const { items, total } = await mongoPaginate<ConversationDocument>({
      model: this.model,
      pagination: filter.pagination,
      filter: mongoFilter,
    });

    return { items: this.toPlainList<IConversation>(items), total };
  }
}
