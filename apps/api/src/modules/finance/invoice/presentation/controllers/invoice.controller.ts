import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { FindInvoicesQuery } from '@modules/finance/invoice/application/queries/find-invoices/find-invoices.query';
import { GetInvoiceByPaymentIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-payment-id/get-invoice-by-payment-id.query';
import { GetInvoiceByIdQuery } from '@modules/finance/invoice/application/queries/get-invoice-by-id/get-invoice-by-id.query';

/**
 * Fatura okuma yüzeyi. Faturalar event-driven üretildiği için manuel kesim endpoint'i
 * yoktur; yalnız listeleme/detay. Kapsam aktörün organizasyonu + kliniğidir (policy).
 */
@UseGuards(AuthGuard)
@Controller()
export class InvoiceController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get()
  list(
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Query('clinicId') clinicId?: string
  ) {
    return this.queryBus.execute(
      new FindInvoicesQuery({ pagination, ctx, clinicId, organizationId })
    );
  }

  // ':id'den ÖNCE tanımlı olmalı; aksi halde 'by-payment' bir id gibi eşleşir.
  @Get('by-payment/:paymentId')
  getByPaymentId(
    @Param('paymentId') paymentId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetInvoiceByPaymentIdQuery(paymentId, ctx)
    );
  }

  @Get(':id')
  getById(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new GetInvoiceByIdQuery(id, ctx));
  }
}
