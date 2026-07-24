import { Pagination } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { IQuery } from '@nestjs/cqrs';
import { GetProviderAvailabilityQueryResponse } from '@modules/clinical/appointment/application/queries/get-provider-availability/get-provider-availability.response';
import { GetProviderCalendar } from '@shared/modules/appointment/types/queries/get-provider.calendar.type';

interface GetProviderCalendarQueryPayload {
  filter: GetProviderCalendar;
  ctx: IGetContext;
  pagination: Pagination;
}

export class GetProviderCalendarQuery implements IQuery {
  readonly __responseType!: GetProviderAvailabilityQueryResponse;
  constructor(public readonly payload: GetProviderCalendarQueryPayload) {}
}
