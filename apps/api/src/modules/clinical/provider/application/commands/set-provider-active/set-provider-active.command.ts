import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderActiveDto } from '@shared/modules/provider/dto/set-provider-active.dto';

export class SetProviderActiveCommand {
  constructor(
    public readonly providerId: string,
    public readonly dto: SetProviderActiveDto,
    public readonly ctx: IGetContext
  ) {}
}
