import { IQuery } from '@nestjs/cqrs';
import { FinancialEventType } from '@prisma/client';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetFinancialEventsResponse } from './get-financial-events.response';

export class GetFinancialEventsQuery implements IQuery {
  readonly __responseType!: GetFinancialEventsResponse;
  constructor(
    public readonly organizationId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext,
    public readonly type?: FinancialEventType,
    public readonly sourceModule?: string,
    public readonly sourceRefId?: string
  ) {}
}
