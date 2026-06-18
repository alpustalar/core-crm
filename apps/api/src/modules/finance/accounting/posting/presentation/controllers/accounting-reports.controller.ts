import {
  BadRequestException,
  Controller,
  Get,
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

  @Get('ledger')
  ledger(
    @GetContext() ctx: IGetContext,
    @Query('accountCode') accountCode: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    if (!accountCode) {
      throw new BadRequestException('accountCode zorunludur.');
    }
    return this.queryBus.execute(
      new GetAccountLedgerQuery(
        this.resolveClinicId(ctx),
        accountCode,
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  @Get('journal')
  journal(
    @GetContext() ctx: IGetContext,
    @Query() pagination: PaginationDto,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetJournalReportQuery(
        this.resolveClinicId(ctx),
        pagination,
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  @Get('income-statement')
  incomeStatement(
    @GetContext() ctx: IGetContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetIncomeStatementQuery(
        this.resolveClinicId(ctx),
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  @Get('balance-sheet')
  balanceSheet(
    @GetContext() ctx: IGetContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetBalanceSheetQuery(
        this.resolveClinicId(ctx),
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  @Get('cash-flow')
  cashFlow(
    @GetContext() ctx: IGetContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetCashFlowQuery(
        this.resolveClinicId(ctx),
        ctx,
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
    );
  }

  @Get('vat-declaration')
  vatDeclaration(
    @GetContext() ctx: IGetContext,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.queryBus.execute(
      new GetVatDeclarationQuery(
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
