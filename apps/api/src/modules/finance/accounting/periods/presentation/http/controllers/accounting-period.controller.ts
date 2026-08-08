import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { OpenPeriodCommand } from '@modules/finance/accounting/periods/application/commands/open-period/open-period.command';
import { LockPeriodCommand } from '@modules/finance/accounting/periods/application/commands/lock-period/lock-period.command';
import { ReopenPeriodCommand } from '@modules/finance/accounting/periods/application/commands/reopen-period/reopen-period.command';
import { ClosePeriodCommand } from '@modules/finance/accounting/periods/application/commands/close-period/close-period.command';
import { GetAccountingPeriodsQuery } from '@modules/finance/accounting/periods/application/queries/get-accounting-periods/get-accounting-periods.query';

@UseGuards(AuthGuard)
@Controller('periods')
export class AccountingPeriodController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  openPeriod(
    @GetContext() ctx: IGetContext,
    @Body('year') year: number,
    @Query('clinicId', ParseUUIDPipe) clinicId: string
  ) {
    return this.commandBus.execute(
      new OpenPeriodCommand({
        clinicId,
        year,
        ctx,
      })
    );
  }

  @Get()
  getPeriods(
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string
  ) {
    return this.queryBus.execute(new GetAccountingPeriodsQuery(clinicId, ctx));
  }

  @Post(':id/lock')
  lockPeriod(@GetContext() ctx: IGetContext, @Param('id') id: string) {
    return this.commandBus.execute(new LockPeriodCommand(id, ctx));
  }

  @Post(':id/reopen')
  reopenPeriod(@GetContext() ctx: IGetContext, @Param('id') id: string) {
    return this.commandBus.execute(new ReopenPeriodCommand(id, ctx));
  }

  /** Dönemi kapatır: yıl sonu kapanış fişlerini üretir + CLOSED'a alır. */
  @Post(':id/close')
  closePeriod(@GetContext() ctx: IGetContext, @Param('id') id: string) {
    return this.commandBus.execute(new ClosePeriodCommand(id, ctx));
  }
}
