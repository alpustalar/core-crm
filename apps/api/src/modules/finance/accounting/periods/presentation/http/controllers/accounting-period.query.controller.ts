import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetAccountingPeriodsQuery } from '@modules/finance/accounting/periods/application/queries/get-accounting-periods/get-accounting-periods.query';
import { Serialize } from '@common/decorators/serialize.decorator';
import { AccountingPeriodResponseDto } from '@modules/finance/accounting/periods/presentation/http/dto/accounting-period-response.dto';
import type { AccountingPeriod } from '@shared';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { ACCOUNTINGPERIOD } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(ACCOUNTINGPERIOD.read)
@Controller('periods')
export class AccountingPeriodQueryController {
  constructor(private readonly queryBus: TSQueryBus) {}
  @Get()
  @Serialize<AccountingPeriod, AccountingPeriodResponseDto>(
    AccountingPeriodResponseDto
  )
  getPeriods(
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string
  ) {
    return this.queryBus.execute(new GetAccountingPeriodsQuery(clinicId, ctx));
  }
}
