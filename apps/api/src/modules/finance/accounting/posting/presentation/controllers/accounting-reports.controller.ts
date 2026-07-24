import {
  BadRequestException,
  Controller,
  Get,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetTrialBalanceQuery } from '@modules/finance/accounting/posting/application/queries/get-trial-balance/get-trial-balance.query';
import { GetAccountLedgerQuery } from '@modules/finance/accounting/posting/application/queries/get-account-ledger/get-account-ledger.query';
import { GetJournalReportQuery } from '@modules/finance/accounting/posting/application/queries/get-journal-report/get-journal-report.query';
import { GetIncomeStatementQuery } from '@modules/finance/accounting/posting/application/queries/get-income-statement/get-income-statement.query';
import { GetBalanceSheetQuery } from '@modules/finance/accounting/posting/application/queries/get-balance-sheet/get-balance-sheet.query';
import { GetCashFlowQuery } from '@modules/finance/accounting/posting/application/queries/get-cash-flow/get-cash-flow.query';
import { GetVatDeclarationQuery } from '@modules/finance/accounting/posting/application/queries/get-vat-declaration/get-vat-declaration.query';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

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
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetTrialBalanceQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('ledger')
  ledger(
    @GetContext() ctx: IGetContext,
    @Query('accountCode') accountCode: string,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    if (!accountCode) {
      throw new BadRequestException('accountCode zorunludur.');
    }
    return this.queryBus.execute(
      new GetAccountLedgerQuery({
        clinicId,
        accountCode,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('journal')
  journal(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetJournalReportQuery({
        clinicId,
        pagination,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('income-statement')
  incomeStatement(
    @GetContext() ctx: IGetContext,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetIncomeStatementQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('balance-sheet')
  balanceSheet(
    @GetContext() ctx: IGetContext,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetBalanceSheetQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('cash-flow')
  cashFlow(
    @GetContext() ctx: IGetContext,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetCashFlowQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }

  @Get('vat-declaration')
  vatDeclaration(
    @GetContext() ctx: IGetContext,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetVatDeclarationQuery({
        clinicId,
        ctx,
        dateFrom: dateFrom ? DateTimeManager.create(dateFrom) : undefined,
        dateTo: dateTo ? DateTimeManager.create(dateTo) : undefined,
      })
    );
  }
}
