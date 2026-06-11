import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetTrialBalanceQuery } from '@modules/finance/accounting/posting/application/queries/get-trial-balance/get-trial-balance.query';

/**
 * Resmî muhasebe raporları (şube/defter bazlı): Mizan, ileride Defter-i Kebir +
 * Yevmiye. Kapsam aktörün clinic bağlamıdır (clinic = source-of-truth).
 */
@UseGuards(AuthGuard)
@Controller('reports')
export class AccountingReportsController {
  constructor(private readonly queryBus: TSQueryBus) {}

  @Get('trial-balance')
  trialBalance(
    @GetContext() ctx: IGetContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetTrialBalanceQuery(
        this.resolveClinicId(ctx),
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  private resolveClinicId(ctx: IGetContext): string {
    const clinicId = ctx.actor.clinicId;
    if (!clinicId) {
      throw new BadRequestException('Aktörün clinic bağlamı yok.');
    }
    return clinicId;
  }
}
