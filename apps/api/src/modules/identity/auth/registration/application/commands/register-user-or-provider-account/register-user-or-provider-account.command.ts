import { IGetContext } from '@common/decorators/get-context.decorator';
import { RegisterUserOrProviderAccount } from '@shared';
import { RegisterUserOrProviderInternalRelations } from '@modules/identity/auth/registration/domain/register.contracts';

export class RegisterUserOrProviderAccountCommand {
  constructor(
    public readonly payload: {
      data: RegisterUserOrProviderAccount;
      ctx: IGetContext;
      internalRelations?: RegisterUserOrProviderInternalRelations;
    }
  ) {}
}
