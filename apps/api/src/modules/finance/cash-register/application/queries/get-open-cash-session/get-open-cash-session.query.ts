import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetOpenCashSessionResponse } from './get-open-cash-session.response';

export class GetOpenCashSessionQuery implements IQuery {
  readonly __responseType!: GetOpenCashSessionResponse;
  constructor(
    public readonly registerId: string,
    public readonly ctx: IGetContext
  ) {}
}
