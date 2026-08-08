import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators';
import { GetConversationMessagesResponse } from './get-conversation-messages.response';

/** Bir yazışmanın mesajlarını sayfalı (kronolojik) döner. */
export class GetConversationMessagesQuery implements IQuery {
  readonly __responseType!: GetConversationMessagesResponse;
  constructor(
    public readonly payload: {
      clinicId: string;
      conversationId: string;
      pagination: Pagination;
      ctx: IGetContext;
    }
  ) {}
}
