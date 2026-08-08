import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetMetaAccountsResponse } from './get-meta-accounts.response';

export class GetMetaAccountsQuery implements IQuery {
  readonly __responseType!: GetMetaAccountsResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
