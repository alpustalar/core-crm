import { IGetContext } from '@common/decorators';

export class InitializeChartOfAccountsCommand {
  constructor(
    public readonly payload: {
      readonly clinicId: string;
      readonly organizationId?: string | null;
      readonly ctx: IGetContext;
    }
  ) {}
}
