import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProviderAvailability } from '@shared';

export class CreateProviderAvailabilityCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly data: CreateProviderAvailability
  ) {}
}
