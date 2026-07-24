import { RegisterClinicAccount } from '@shared';
import { IGetContext } from '@common/decorators';

export class RegisterClinicAccountCommand {
  constructor(
    public readonly payload: {
      data: RegisterClinicAccount;
      ctx: IGetContext;
    }
  ) {}
}
