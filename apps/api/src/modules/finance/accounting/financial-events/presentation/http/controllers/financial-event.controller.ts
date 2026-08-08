import {
  Body,
  Controller,
  Get,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { GetFinancialEventsQuery } from '@modules/finance/accounting/financial-events/application/queries/get-financial-events/get-financial-events.query';
import { RecordSupplierPaymentCommand } from '@modules/finance/accounting/financial-events/application/commands/record-supplier-payment/record-supplier-payment.command';
import { RecordSupplierPaymentDto } from '@shared/modules/financial-event/dto/record-supplier-payment.dto';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

@UseGuards(AuthGuard)
@Controller('financial-events')
export class FinancialEventController {
  constructor(
    private readonly queryBus: TSQueryBus,
    private readonly commandBus: TSCommandBus
  ) {}

  /** Satıcıya ödeme kaydeder — 320'deki cari borcu kapatır. */
  @Post('supplier-payments')
  recordSupplierPayment(
    @Body() dto: RecordSupplierPaymentDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordSupplierPaymentCommand({ data: dto, ctx })
    );
  }

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
