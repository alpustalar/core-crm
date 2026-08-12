import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  AutoMatchStatementLinesDto,
  ImportBankStatementDto,
  ReconcileStatementLineDto,
} from '@shared/modules/bank/dto/commands';
import { ImportBankStatementCommand } from '@modules/finance/bank/application/commands/import-bank-statement/import-bank-statement.command';
import { ReconcileStatementLineCommand } from '@modules/finance/bank/application/commands/reconcile-statement-line/reconcile-statement-line.command';
import { AutoMatchStatementLinesCommand } from '@modules/finance/bank/application/commands/auto-match-statement-lines/auto-match-statement-lines.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { BANKSTATEMENT, BANKSTATEMENTLINE } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('statements')
export class BankStatementCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(BANKSTATEMENT.create)
  @Post()
  import(@Body() dto: ImportBankStatementDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new ImportBankStatementCommand(dto, ctx));
  }

  /** Oto-eşleştirme taraması: yalnız tutar+yön birebir ve tek aday olan satırları kapatır. */
  @HasCapability(BANKSTATEMENTLINE.update)
  @Post(':statementId/auto-match')
  autoMatch(
    @Param('statementId', ParseUUIDPipe) statementId: string,
    @Body() dto: AutoMatchStatementLinesDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AutoMatchStatementLinesCommand({
        bankStatementId: statementId,
        data: dto,
        ctx,
      })
    );
  }

  @HasCapability(BANKSTATEMENTLINE.update)
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
