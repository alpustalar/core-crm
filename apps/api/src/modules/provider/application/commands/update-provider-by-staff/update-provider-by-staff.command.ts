import { UpdateProviderDto } from '@shared/modules/provider/dto/update-provider.dto';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class UpdateProviderByStaffCommand {
  constructor(
    public readonly providerId: string,
    public readonly dto: UpdateProviderDto,
    public readonly context: IGetContext
  ) {}
}
