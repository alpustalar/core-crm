import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { RecordPayrollAccrualDto } from '@shared/modules/payroll/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RecordPayrollAccrualCommand } from '@modules/finance/payroll/application/commands/record-payroll-accrual/record-payroll-accrual.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

/**
 * Bordro tahakkuku — hesaplanmış (brüt→net) rakamlar dışarıdan gelir; finans yalnız
 * tahakkuk fişini (770×2 / 335 + 360 + 361) üretir. Kapsam aktörün clinic bağlamıdır.
 */
const { FINANCIALEVENT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class PayrollCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(FINANCIALEVENT.create)
  @Post('accruals')
  recordAccrual(
    @Body() dto: RecordPayrollAccrualDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new RecordPayrollAccrualCommand(dto, ctx));
  }
}
