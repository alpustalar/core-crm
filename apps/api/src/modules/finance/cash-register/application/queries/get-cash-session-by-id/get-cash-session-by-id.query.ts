import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetCashSessionByIdResponse } from './get-cash-session-by-id.response';

export class GetCashSessionByIdQuery implements IQuery {
  readonly __responseType!: GetCashSessionByIdResponse;
  constructor(
    public readonly sessionId: string,
    public readonly ctx: IGetContext
  ) {}
}
