import { IQuery } from '@nestjs/cqrs';
import { GetBankStatements } from '@shared/modules/bank/types/queries';
import { Pagination } from '@shared/common';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetBankStatementsResponse } from './get-bank-statements.response';

export class GetBankStatementsQuery implements IQuery {
  readonly __responseType!: GetBankStatementsResponse;
  constructor(
    public readonly payload: {
      readonly filter: GetBankStatements;
      readonly pagination: Pagination;
      readonly ctx: IGetContext;
    }
  ) {}
}
