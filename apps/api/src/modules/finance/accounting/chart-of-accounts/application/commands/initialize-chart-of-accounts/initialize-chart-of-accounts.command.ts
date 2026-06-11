import { IGetContext } from '@common/decorators';

export class InitializeChartOfAccountsCommand {
  constructor(
    public readonly clinicId: string,
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
