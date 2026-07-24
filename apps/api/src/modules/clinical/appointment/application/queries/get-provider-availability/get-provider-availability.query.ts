import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetProviderAvailabilityQueryResponse } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.response';
import { GetProviderAvailability } from '@shared/modules/appointment/types/queries/get-provider-availability.type';

export class GetProviderAvailabilityQuery implements IQuery {
  readonly __responseType!: GetProviderAvailabilityQueryResponse;
  constructor(
    public readonly filter: GetProviderAvailability,
    public readonly ctx: IGetContext
  ) {}
}
