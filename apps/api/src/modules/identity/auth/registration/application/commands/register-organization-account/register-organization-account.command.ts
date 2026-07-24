import { RegisterOrganizationAccount } from '@shared';
import { IGetContext } from '@common/decorators';

export class RegisterOrganizationAccountCommand {
  constructor(
    public readonly payload: {
      data: RegisterOrganizationAccount;
      ctx: IGetContext;
    }
  ) {}
}
