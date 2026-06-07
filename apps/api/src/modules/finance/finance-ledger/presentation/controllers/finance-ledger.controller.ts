import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetLedgerByClinicIdQuery } from '@modules/finance/finance-ledger/application/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.query';
import { GetClinicFinanceSummaryQuery } from '@modules/finance/finance-ledger/application/queries/get-clinic-finance-summary/get-clinic-finance-summary.query';
import { GetPatientFinanceSummaryQuery } from '@modules/finance/finance-ledger/application/queries/get-patient-finance-summary/get-patient-finance-summary.query';

@UseGuards(AuthGuard)
@Controller('finance-ledger')
export class FinanceLedgerController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('clinic/:clinicId')
  getClinicLedger(
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() pagination: PaginationDto
  ) {
    return this.queryBus.execute(
      new GetLedgerByClinicIdQuery(clinicId, pagination, ctx)
    );
  }

  @Get('clinic/:clinicId/summary')
  getClinicSummary() {
    // TODO: tamamla
    return this.queryBus.execute(new GetClinicFinanceSummaryQuery('ok'));
  }

  @Get('patient/:patientId/summary')
  getPatientSummary(
    @GetContext() ctx: IGetContext,
    @Param('patientId', ParseUUIDPipe) patientId: string
  ) {
    return this.queryBus.execute(
      new GetPatientFinanceSummaryQuery(patientId, ctx)
    );
  }

  @Get('patient/:patientId')
  getPatientLedger() {}
  // TODO: isminin mantığına göre tamamla
}
