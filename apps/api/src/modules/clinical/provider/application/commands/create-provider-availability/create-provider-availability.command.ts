import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateProviderAvailabilityDto } from '@shared';

export class CreateProviderAvailabilityCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly dto: CreateProviderAvailabilityDto
  ) {}
}
