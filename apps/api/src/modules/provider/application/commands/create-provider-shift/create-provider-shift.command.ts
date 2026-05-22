import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProviderShiftDto } from '@shared';

export class CreateProviderShiftCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly dto: CreateProviderShiftDto,
  ) {}
}
