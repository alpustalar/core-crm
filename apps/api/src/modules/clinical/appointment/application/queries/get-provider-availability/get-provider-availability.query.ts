import { GetProviderAvailabilityDto } from '@shared/modules/appointment/dto/queries/get-provider-availability.dto';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetProviderAvailabilityQueryResponse } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.response';

export class GetProviderAvailabilityQuery implements IQuery {
  readonly __responseType!: GetProviderAvailabilityQueryResponse;
  constructor(
    public readonly dto: GetProviderAvailabilityDto,
    public readonly ctx: IGetContext
  ) {}
}
