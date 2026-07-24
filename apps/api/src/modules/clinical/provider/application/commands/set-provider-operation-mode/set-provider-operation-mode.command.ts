import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderOperationMode } from '@shared';

export class SetProviderOperationModeCommand {
  constructor(
    public readonly payload: {
      readonly providerId: string;
      readonly data: SetProviderOperationMode;
      readonly ctx: IGetContext;
    }
  ) {}
}
