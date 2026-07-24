import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProviderShift } from '@shared';

export class CreateProviderShiftCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly data: CreateProviderShift
  ) {}
}
