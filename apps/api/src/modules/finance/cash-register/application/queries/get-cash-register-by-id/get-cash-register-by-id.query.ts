import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetCashRegisterByIdResponse } from './get-cash-register-by-id.response';

export class GetCashRegisterByIdQuery implements IQuery {
  readonly __responseType!: GetCashRegisterByIdResponse;
  constructor(
    public readonly registerId: string,
    public readonly ctx: IGetContext
  ) {}
}
