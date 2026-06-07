import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateProviderInfoDto } from '@shared/modules/provider/dto/update-provider-info.dto';

export class UpdateProviderInfoCommand {
  constructor(
    public readonly providerId: string,
    public readonly dto: UpdateProviderInfoDto,
    public readonly ctx: IGetContext
  ) {}
}
