import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetLedgerByClinicIdQuery } from '@modules/finance/finance-ledger/application/queries/get-ledger-by-clinic-id/get-ledger-by-clinic-id.query';
import { GetClinicFinanceSummaryQuery } from '@modules/finance/finance-ledger/application/queries/get-clinic-finance-summary/get-clinic-finance-summary.query';
import { GetPatientFinanceSummaryQuery } from '@modules/finance/finance-ledger/application/queries/get-patient-finance-summary/get-patient-finance-summary.query';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Serialize } from '@common/decorators/serialize.decorator';
import {
  FinanceLedgerResponseDto,
  LedgerSummaryResponseDto,
  PatientFinanceSummaryResponseDto,
  PatientLedgerItemResponseDto,
} from '@modules/finance/finance-ledger/presentation/http/dto/finance-ledger-response.dto';
import type { FinanceLedger } from '@shared';
import type {
  LedgerSummary,
  PatientFinanceSummary,
  PatientLedgerItem,
} from '@modules/finance/finance-ledger/domain/contracts/finance-ledger.contracts';
import { GetLedgerByPatientIdQuery } from '@modules/finance/finance-ledger/application/queries/get-ledger-by-patient-id/get-ledger-by-patient-id.query';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { FINANCELEDGER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@HasCapability(FINANCELEDGER.read)
@Controller('finance-ledger')
export class FinanceLedgerController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Get('clinic/:clinicId')
  @Serialize<FinanceLedger, FinanceLedgerResponseDto>(FinanceLedgerResponseDto)
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
  @Serialize<LedgerSummary, LedgerSummaryResponseDto>(LedgerSummaryResponseDto)
  getClinicSummary(
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetClinicFinanceSummaryQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('patient/:patientId/summary')
  @Serialize<PatientFinanceSummary, PatientFinanceSummaryResponseDto>(
    PatientFinanceSummaryResponseDto
  )
  getPatientSummary(
    @GetContext() ctx: IGetContext,
    @Param('patientId', ParseUUIDPipe) patientId: string
  ) {
    return this.queryBus.execute(
      new GetPatientFinanceSummaryQuery(patientId, ctx)
    );
  }

  /** Hastanın cari hareket dökümü (sayfalı). */
  @Get('patient/:patientId')
  @Serialize<PatientLedgerItem, PatientLedgerItemResponseDto>(
    PatientLedgerItemResponseDto
  )
  getPatientLedger(
    @GetContext() ctx: IGetContext,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() pagination: PaginationDto
  ) {
    return this.queryBus.execute(
      new GetLedgerByPatientIdQuery({ patientId, pagination, ctx })
    );
  }
}
