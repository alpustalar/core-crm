import { IQuery } from '@nestjs/cqrs';
import { GetCashSessions } from '@shared/modules/cash-register/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetCashSessionsResponse } from './get-cash-sessions.response';

export class GetCashSessionsQuery implements IQuery {
  readonly __responseType!: GetCashSessionsResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetCashSessions;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
