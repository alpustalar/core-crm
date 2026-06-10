import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { OpenPeriodCommand } from '@modules/finance/accounting/periods/application/commands/open-period/open-period.command';
import { GetAccountingPeriodsQuery } from '@modules/finance/accounting/periods/application/queries/get-accounting-periods/get-accounting-periods.query';

@UseGuards(AuthGuard)
@Controller('periods')
export class AccountingPeriodController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  openPeriod(@GetContext() ctx: IGetContext, @Body('year') year: number) {
    return this.commandBus.execute(
      new OpenPeriodCommand(this.resolveOrganizationId(ctx), year, ctx)
    );
  }

  @Get()
  getPeriods(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new GetAccountingPeriodsQuery(this.resolveOrganizationId(ctx), ctx)
    );
  }

  private resolveOrganizationId(ctx: IGetContext): string {
    const organizationId = ctx.actor.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Aktörün organization bağlamı yok.');
    }
    return organizationId;
  }
}
