import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderOperationModeDto } from '@shared/modules/provider/dto/set-provider-operation-mode.dto';

export class SetProviderOperationModeCommand {
  constructor(
    public readonly providerId: string,
    public readonly dto: SetProviderOperationModeDto,
    public readonly ctx: IGetContext
  ) {}
}
