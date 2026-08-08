import {
  Controller,
  Get,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetFinancialEventsQuery } from '@modules/finance/accounting/financial-events/application/queries/get-financial-events/get-financial-events.query';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

@UseGuards(AuthGuard)
@Controller('financial-events')
export class FinancialEventController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get()
  getEvents(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('type') type?: FinancialEventType,
    @Query('sourceModule') sourceModule?: string,
    @Query('sourceRefId') sourceRefId?: string
  ) {
    return this.queryBus.execute(
      new GetFinancialEventsQuery({
        organizationId,
        pagination,
        ctx,
        type,
        sourceModule,
        sourceRefId,
      })
    );
  }
}
