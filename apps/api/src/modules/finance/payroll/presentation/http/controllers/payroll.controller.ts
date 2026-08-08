import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { RecordPayrollAccrualDto } from '@shared/modules/payroll/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RecordPayrollAccrualCommand } from '@modules/finance/payroll/application/commands/record-payroll-accrual/record-payroll-accrual.command';

/**
 * Bordro tahakkuku — hesaplanmış (brüt→net) rakamlar dışarıdan gelir; finans yalnız
 * tahakkuk fişini (770×2 / 335 + 360 + 361) üretir. Kapsam aktörün clinic bağlamıdır.
 */
@UseGuards(AuthGuard)
@Controller()
export class PayrollController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('accruals')
  recordAccrual(
    @Body() dto: RecordPayrollAccrualDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new RecordPayrollAccrualCommand(dto, ctx));
  }
}
