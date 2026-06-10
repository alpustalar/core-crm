import { IGetContext } from '@common/decorators';

export class InitializeChartOfAccountsCommand {
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
