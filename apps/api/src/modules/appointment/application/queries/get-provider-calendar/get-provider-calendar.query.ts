import { GetProviderCalendarDto, PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetProviderAvailabilityQueryResponse } from '@modules/appointment/application/queries/get-provider-availability/get-provider-availability.response';

export class GetProviderCalendarQuery implements IQuery {
  readonly __responseType!: GetProviderAvailabilityQueryResponse;
  constructor(
    public readonly dto: GetProviderCalendarDto,
    public readonly ctx: IGetContext,
    public readonly pagination: PaginationDto
  ) {}
}
