import { IQuery } from '@nestjs/cqrs';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetFinancialEventsResponse } from './get-financial-events.response';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

export class GetFinancialEventsQuery implements IQuery {
  readonly __responseType!: GetFinancialEventsResponse;
  constructor(
    public readonly payload: {
      organizationId: string;
      pagination: PaginationDto;
      ctx: IGetContext;
      type?: FinancialEventType;
      sourceModule?: string;
      sourceRefId?: string;
    }
  ) {}
}
