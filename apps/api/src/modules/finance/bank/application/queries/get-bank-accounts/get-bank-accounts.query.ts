import { IQuery } from '@nestjs/cqrs';
import { GetBankAccounts } from '@shared/modules/bank/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetBankAccountsResponse } from './get-bank-accounts.response';

export class GetBankAccountsQuery implements IQuery {
  readonly __responseType!: GetBankAccountsResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetBankAccounts;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
