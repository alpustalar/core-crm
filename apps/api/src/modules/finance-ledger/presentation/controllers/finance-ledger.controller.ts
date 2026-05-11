import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { Actor } from '@common/decorators';
import { ActorContext } from '@common/interfaces';
import { Pagination } from '@shared';
import { GetLedgerByClinicIdUseCase } from '@modules/finance-ledger/application/use-cases/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.use-case';
import { GetLedgerByPatientIdUseCase } from '@modules/finance-ledger/application/use-cases/queries/get-ledger-by-patient-id/get-ledger-by-patient-id.use-case';
import { GetClinicFinanceSummaryUseCase } from '@modules/finance-ledger/application/use-cases/queries/get-clinic-finance-summary/get-clinic-finance-summary.use-case';

@UseGuards(AuthGuard)
@Controller('finance-ledger')
export class FinanceLedgerController {
  constructor(
    private readonly getLedgerByClinicId: GetLedgerByClinicIdUseCase,
    private readonly getLedgerByPatientId: GetLedgerByPatientIdUseCase,
    private readonly getClinicFinanceSummary: GetClinicFinanceSummaryUseCase
  ) {}

  @Get('clinic/:clinicId')
  getClinicLedger(
    @Actor() _actor: ActorContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query() pagination: Pagination
  ) {
    return this.getLedgerByClinicId.execute({ clinicId, pagination });
  }

  @Get('clinic/:clinicId/summary')
  getClinicSummary(
    @Actor() _actor: ActorContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.getClinicFinanceSummary.execute({
      clinicId,
      filter: {
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
    });
  }

  @Get('patient/:patientId')
  getPatientLedger(
    @Actor() _actor: ActorContext,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() pagination: Pagination
  ) {
    return this.getLedgerByPatientId.execute({ patientId, pagination });
  }
}
