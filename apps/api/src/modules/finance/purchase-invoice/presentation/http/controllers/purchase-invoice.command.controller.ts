import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { RecordPurchaseInvoiceDto } from '@shared/modules/purchase-invoice/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RecordPurchaseInvoiceCommand } from '@modules/finance/purchase-invoice/application/commands/record-purchase-invoice/record-purchase-invoice.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PURCHASEINVOICE } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class PurchaseInvoiceCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PURCHASEINVOICE.create)
  @Post()
  record(
    @Body() dto: RecordPurchaseInvoiceDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new RecordPurchaseInvoiceCommand(dto, ctx));
  }
}
