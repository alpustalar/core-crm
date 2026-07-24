import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetBankStatementByIdResponse } from './get-bank-statement-by-id.response';

export class GetBankStatementByIdQuery implements IQuery {
  readonly __responseType!: GetBankStatementByIdResponse;
  constructor(
    public readonly statementId: string,
    public readonly ctx: IGetContext
  ) {}
}
