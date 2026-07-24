import { IQuery } from '@nestjs/cqrs';
import { Pagination } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetMyNotificationsResponse } from './get-my-notifications.response';

export class GetMyNotificationsQuery implements IQuery {
  readonly __responseType!: GetMyNotificationsResponse;

  constructor(
    public readonly payload: {
      pagination: Pagination;
      ctx: IGetContext;
      onlyUnread?: boolean;
    }
  ) {}
}
