import {
  Controller,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { InitializeChartOfAccountsCommand } from '@modules/finance/accounting/chart-of-accounts/application/commands/initialize-chart-of-accounts/initialize-chart-of-accounts.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { ACCOUNT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('chart-of-accounts')
export class ChartOfAccountsCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(ACCOUNT.create)
  @Post('initialize')
  initialize(
    @GetContext() ctx: IGetContext,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId?: string | null
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
