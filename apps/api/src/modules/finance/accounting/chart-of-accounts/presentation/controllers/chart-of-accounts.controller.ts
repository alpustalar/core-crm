import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { InitializeChartOfAccountsCommand } from '@modules/finance/accounting/chart-of-accounts/application/commands/initialize-chart-of-accounts/initialize-chart-of-accounts.command';
import { GetChartOfAccountsQuery } from '@modules/finance/accounting/chart-of-accounts/application/queries/get-chart-of-accounts/get-chart-of-accounts.query';

@UseGuards(AuthGuard)
@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('initialize')
  initialize(@GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new InitializeChartOfAccountsCommand(
        this.resolveClinicId(ctx),
        this.resolveOrganizationId(ctx),
        ctx
      )
    );
  }

  @Get()
  getChart(@GetContext() ctx: IGetContext) {
    return this.queryBus.execute(
      new GetChartOfAccountsQuery(this.resolveClinicId(ctx), ctx)
    );
  }

  private resolveClinicId(ctx: IGetContext): string {
    const clinicId = ctx.actor.clinicId;
    if (!clinicId) {
      throw new BadRequestException('Aktörün clinic bağlamı yok.');
    }
    return clinicId;
  }

  private resolveOrganizationId(ctx: IGetContext): string {
    const organizationId = ctx.actor.organizationId;
    if (!organizationId) {
      throw new BadRequestException('Aktörün organization bağlamı yok.');
    }
    return organizationId;
  }
}
