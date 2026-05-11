import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProviderAvailabilityDto } from '@shared';

export class CreateProviderAvailabilityCommand {
  constructor(
    public readonly context: IGetContext,
    public readonly dto: CreateProviderAvailabilityDto
  ) {}
}
