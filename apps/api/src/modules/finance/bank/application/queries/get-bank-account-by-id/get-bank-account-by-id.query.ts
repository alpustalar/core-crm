import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetBankAccountByIdResponse } from './get-bank-account-by-id.response';

export class GetBankAccountByIdQuery implements IQuery {
  readonly __responseType!: GetBankAccountByIdResponse;
  constructor(
    public readonly accountId: string,
    public readonly ctx: IGetContext
  ) {}
}
