import { IQuery } from '@nestjs/cqrs';
import { SearchTransferAvailabilityDto } from '@shared/modules/health-tourism/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { SearchTransferAvailabilityResponse } from './search-transfer-availability.response';

export class SearchTransferAvailabilityQuery implements IQuery {
  readonly __responseType!: SearchTransferAvailabilityResponse;

  constructor(
    public readonly dto: SearchTransferAvailabilityDto,
    public readonly ctx: IGetContext,
  ) {}
}
