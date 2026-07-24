import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { SearchTransferAvailabilityResponse } from './search-transfer-availability.response';
import { SearchTransferAvailability } from '@shared/modules/health-tourism';

export class SearchTransferAvailabilityQuery implements IQuery {
  readonly __responseType!: SearchTransferAvailabilityResponse;

  constructor(
    public readonly filter: SearchTransferAvailability,
    public readonly ctx: IGetContext
  ) {}
}
