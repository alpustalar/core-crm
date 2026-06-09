import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';

export class UpdateProviderInfoCommand {
  public readonly __responseType: void;
  constructor(
    public readonly providerId: string,
    public readonly dto: UpdateProviderInfoDto,
    public readonly ctx: IGetContext
  ) {}
}
