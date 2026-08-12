import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RecordSupplierPaymentCommand } from '@modules/finance/accounting/financial-events/application/commands/record-supplier-payment/record-supplier-payment.command';
import { RecordSupplierPaymentDto } from '@shared/modules/financial-event/dto/commands';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { FINANCIALEVENT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('financial-events')
export class FinancialEventCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  /** Satıcıya ödeme kaydeder — 320'deki cari borcu kapatır. */
  @HasCapability(FINANCIALEVENT.create)
  @Post('supplier-payments')
  recordSupplierPayment(
    @Body() dto: RecordSupplierPaymentDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordSupplierPaymentCommand({ data: dto, ctx })
    );
  }
}
