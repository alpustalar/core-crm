import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetReconciliationSummaryResponse } from './get-reconciliation-summary.response';

export class GetReconciliationSummaryQuery implements IQuery {
  readonly __responseType!: GetReconciliationSummaryResponse;
  constructor(
    public readonly statementId: string,
    public readonly ctx: IGetContext
  ) {}
}
