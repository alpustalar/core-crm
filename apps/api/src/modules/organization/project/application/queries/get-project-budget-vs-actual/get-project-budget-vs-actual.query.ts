import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetProjectBudgetVsActualResponse } from './get-project-budget-vs-actual.response';

export class GetProjectBudgetVsActualQuery implements IQuery {
  readonly __responseType!: GetProjectBudgetVsActualResponse;

  constructor(
    public readonly projectId: string,
    public readonly ctx: IGetContext
  ) {}
}
