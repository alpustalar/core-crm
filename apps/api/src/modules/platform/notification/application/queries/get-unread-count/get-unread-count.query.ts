import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetUnreadCountResponse } from './get-unread-count.response';

export class GetUnreadCountQuery implements IQuery {
  readonly __responseType!: GetUnreadCountResponse;

  constructor(public readonly ctx: IGetContext) {}
}
