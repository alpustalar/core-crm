import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared/common';
import { GetConversationsDto } from '@shared/modules/messaging/dto/queries';
import { IGetContext } from '@common/decorators';
import { GetConversationsResponse } from './get-conversations.response';

/** Bir kliniğin yazışmalarını sayfalı listeler (status/atama filtreli). */
export class GetConversationsQuery implements IQuery {
  readonly __responseType!: GetConversationsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly dto: GetConversationsDto,
    public readonly pagination: Pagination,
    public readonly ctx: IGetContext
  ) {}
}
