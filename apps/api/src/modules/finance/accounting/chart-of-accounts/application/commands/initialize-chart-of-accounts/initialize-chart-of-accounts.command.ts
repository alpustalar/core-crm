import { IGetContext } from '@common/decorators';

export class InitializeChartOfAccountsCommand {
  constructor(
    public readonly payload: {
      clinicId: string;
      organizationId: string;
      ctx: IGetContext;
    }
  ) {}
}
