import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateProviderInfo } from '@shared/modules/provider/types/update-provider-info.type';

export class UpdateProviderInfoCommand {
  public readonly __responseType: void;
  constructor(
    public readonly payload: {
      readonly providerId: string;
      readonly data: UpdateProviderInfo;
      readonly ctx: IGetContext;
    }
  ) {}
}
