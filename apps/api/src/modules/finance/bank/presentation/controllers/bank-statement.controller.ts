import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import {
  ImportBankStatementDto,
  ReconcileStatementLineDto,
} from '@shared/modules/bank/dto/commands';
import { GetBankStatementsFilterDto } from '@shared/modules/bank/dto/queries';
import { ImportBankStatementCommand } from '@modules/finance/bank/application/commands/import-bank-statement/import-bank-statement.command';
import { ReconcileStatementLineCommand } from '@modules/finance/bank/application/commands/reconcile-statement-line/reconcile-statement-line.command';
import { GetBankStatementsQuery } from '@modules/finance/bank/application/queries/get-bank-statements/get-bank-statements.query';
import { GetBankStatementByIdQuery } from '@modules/finance/bank/application/queries/get-bank-statement-by-id/get-bank-statement-by-id.query';
import { GetReconciliationSummaryQuery } from '@modules/finance/bank/application/queries/get-reconciliation-summary/get-reconciliation-summary.query';

@UseGuards(AuthGuard)
@Controller('statements')
export class BankStatementController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  import(@Body() dto: ImportBankStatementDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new ImportBankStatementCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() dto: GetBankStatementsFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetBankStatementsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get(':statementId')
  getById(
    @Param('statementId', ParseUUIDPipe) statementId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetBankStatementByIdQuery(statementId, ctx)
    );
  }

  @Get(':statementId/reconciliation')
  reconciliationSummary(
    @Param('statementId', ParseUUIDPipe) statementId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetReconciliationSummaryQuery(statementId, ctx)
    );
  }

  @Put('lines/:lineId/reconcile')
  reconcileLine(
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @Body() dto: ReconcileStatementLineDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ReconcileStatementLineCommand({ lineId, data: dto, ctx })
    );
  }
}
