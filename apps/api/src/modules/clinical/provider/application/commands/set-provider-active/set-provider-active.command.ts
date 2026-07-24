import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderActive } from '@shared';

export class SetProviderActiveCommand {
  constructor(
    public readonly payload: {
      readonly providerId: string;
      readonly data: SetProviderActive;
      readonly ctx: IGetContext;
    }
  ) {}
}
