import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { InitializeChartOfAccountsCommand } from '@modules/finance/accounting/chart-of-accounts/application/commands/initialize-chart-of-accounts/initialize-chart-of-accounts.command';

@UseGuards(AuthGuard)
@Controller('chart-of-accounts')
export class ChartOfAccountsController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post('initialize')
  initialize(
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Param('organizationId', ParseUUIDPipe) organizationId: string
  ) {
    return this.commandBus.execute(
      new InitializeChartOfAccountsCommand({
        clinicId,
        organizationId,
        ctx,
      })
    );
  }
}
