import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { RecordPurchaseInvoiceDto } from '@shared/modules/purchase-invoice/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { RecordPurchaseInvoiceCommand } from '@modules/finance/purchase-invoice/application/commands/record-purchase-invoice/record-purchase-invoice.command';
import { GetPurchaseInvoicesQuery } from '@modules/finance/purchase-invoice/application/queries/get-purchase-invoices/get-purchase-invoices.query';

/**
 * Alış faturası (tedarikçi) — finance önmuhasebe. Kayıt sonrası muhasebe köprüsü
 * PURCHASE_INVOICE_RECEIVED olayını yazar; fiş 150/770 + 191 / 320 üretilir.
 * Kapsam aktörün clinic bağlamıdır (clinic = source-of-truth).
 */
@UseGuards(AuthGuard)
@Controller()
export class PurchaseInvoiceController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  record(
    @Body() dto: RecordPurchaseInvoiceDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new RecordPurchaseInvoiceCommand(dto, ctx));
  }

  @Get()
  list(@Query() pagination: PaginationDto, @GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new GetPurchaseInvoicesQuery(pagination, ctx)
    );
  }
}
